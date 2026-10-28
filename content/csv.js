var csv = (() => {
  var loaded = false

  function walkBlocks(html) {
    var blocks = []
    var re = /<pre><code class="(?:language-)?(csv|tsv)(?:\s[^"]*)?">([\s\S]+?)<\/code><\/pre>/gi
    var match
    while ((match = re.exec(html))) {
      blocks.push({kind: match[1], raw: match[2]})
    }
    return blocks
  }

  function decodeHtml(html) {
    var txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  function parseRow(line, delimiter) {
    var row = []
    var cell = ''
    var inQuotes = false

    for (var i = 0; i < line.length; i++) {
      var ch = line[i]
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cell += '"'
            i++
          }
          else {
            inQuotes = false
          }
        }
        else {
          cell += ch
        }
      }
      else if (ch === '"') {
        inQuotes = true
      }
      else if (ch === delimiter) {
        row.push(cell)
        cell = ''
      }
      else {
        cell += ch
      }
    }
    row.push(cell)
    return row
  }

  function parseTable(text, delimiter) {
    var lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter((line) => line.length)
    return lines.map((line) => parseRow(line, delimiter))
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"]/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
    }[ch] || ch))
  }

  function compareCells(a, b) {
    var na = Number(a)
    var nb = Number(b)
    if (!Number.isNaN(na) && !Number.isNaN(nb) && a !== '' && b !== '') {
      return na - nb
    }
    return String(a).localeCompare(String(b), undefined, {numeric: true, sensitivity: 'base'})
  }

  function delimiterForKind(kind) {
    return kind === 'tsv' ? '\t' : ','
  }

  function escapeDelimitedCell(cell, delimiter) {
    var s = String(cell != null ? cell : '')
    if (delimiter === '\t') {
      return s
    }
    if (/[",\n\r]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"'
    }
    return s
  }

  function serializeRow(row, delimiter) {
    return row.map((cell) => escapeDelimitedCell(cell, delimiter)).join(delimiter)
  }

  function serializeTableDom(table, kind) {
    var delimiter = delimiterForKind(kind)
    var lines = []
    var headRow = table.querySelector('thead tr')
    if (headRow) {
      lines.push(serializeRow(Array.from(headRow.children).map((th) => th.textContent), delimiter))
    }
    Array.from(table.querySelectorAll('tbody tr')).forEach((tr) => {
      lines.push(serializeRow(Array.from(tr.children).map((td) => td.textContent), delimiter))
    })
    return lines.join('\n')
  }

  function isTableModified(table, filter) {
    if (filter.value.trim()) {
      return true
    }
    return table.dataset.sortCol != null && table.dataset.sortCol !== ''
  }

  function syncModifiedState(host, filter, table) {
    var modified = isTableModified(table, filter)
    host.classList.toggle('md-table-modified', modified)
    var state = host.querySelector('.md-table-state')
    var reset = host.querySelector('.md-table-reset')
    if (state) {
      state.hidden = !modified
    }
    if (reset) {
      reset.hidden = !modified
    }
    var copyBtn = host.querySelector('button.md-copy')
    if (copyBtn) {
      copyBtn.title = modified ? 'Copy visible table' : 'Copy original source from markdown'
    }
  }

  function resetTableView(host, table, rows, head, filter) {
    filter.value = ''
    delete table.dataset.sortCol
    delete table.dataset.sortDir
    Array.from(table.querySelectorAll('thead th')).forEach((cell) => {
      cell.classList.remove('md-table-sort-active')
      cell.dataset.sortOrder = ''
    })
    renderBody(table, rows, head, '')
    syncModifiedState(host, filter, table)
  }

  function renderBody(table, rows, head, filterText) {
    var body = table.querySelector('tbody')
    if (!body) {
      return
    }
    var needle = filterText.trim().toLowerCase()
    var data = rows.slice(1).filter((row) => {
      if (!needle) {
        return true
      }
      return row.some((cell) => String(cell != null ? cell : '').toLowerCase().includes(needle))
    })

    var sortCol = table.dataset.sortCol != null ? parseInt(table.dataset.sortCol, 10) : -1
    var sortDir = table.dataset.sortDir === 'desc' ? -1 : 1
    if (sortCol >= 0) {
      data.sort((a, b) => compareCells(a[sortCol], b[sortCol]) * sortDir)
    }

    body.innerHTML = ''
    data.forEach((row) => {
      var tr = document.createElement('tr')
      head.forEach((_, index) => {
        var td = document.createElement('td')
        td.textContent = row[index] != null ? row[index] : ''
        tr.appendChild(td)
      })
      body.appendChild(tr)
    })
  }

  function attachTableControls(host, rows) {
    if (!rows.length) {
      return
    }

    var toolbar = document.createElement('div')
    toolbar.className = 'md-table-toolbar'
    var state = document.createElement('span')
    state.className = 'md-table-state'
    state.hidden = true
    state.textContent = 'Adjusted view'
    toolbar.appendChild(state)
    var filter = document.createElement('input')
    filter.type = 'search'
    filter.className = 'md-table-filter'
    filter.placeholder = 'Filter rows…'
    filter.setAttribute('aria-label', 'Filter table rows')
    toolbar.appendChild(filter)
    var reset = document.createElement('button')
    reset.type = 'button'
    reset.className = 'md-table-reset'
    reset.hidden = true
    reset.textContent = 'Reset view'
    reset.title = 'Restore the original table from the markdown'
    toolbar.appendChild(reset)
    host.insertBefore(toolbar, host.firstChild)

    var table = host.querySelector('table')
    if (!table) {
      return
    }

    var head = rows[0]
    Array.from(table.querySelectorAll('thead th')).forEach((th, index) => {
      th.classList.add('md-table-sort')
      th.tabIndex = 0
      th.setAttribute('role', 'button')
      th.title = 'Sort by this column'
      var activate = () => {
        var current = parseInt(table.dataset.sortCol, 10)
        if (current === index) {
          table.dataset.sortDir = table.dataset.sortDir === 'asc' ? 'desc' : 'asc'
        }
        else {
          table.dataset.sortCol = String(index)
          table.dataset.sortDir = 'asc'
        }
        Array.from(table.querySelectorAll('thead th')).forEach((cell, col) => {
          cell.classList.toggle('md-table-sort-active', col === index)
          cell.dataset.sortOrder = col === index ? table.dataset.sortDir : ''
        })
        renderBody(table, rows, head, filter.value)
        syncModifiedState(host, filter, table)
      }
      th.addEventListener('click', activate)
      th.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          activate()
        }
      })
    })

    filter.addEventListener('input', () => {
      renderBody(table, rows, head, filter.value)
      syncModifiedState(host, filter, table)
    })

    reset.addEventListener('click', () => {
      resetTableView(host, table, rows, head, filter)
    })

    syncModifiedState(host, filter, table)
  }

  function tableHtml(rows) {
    if (!rows.length) {
      return '<table class="md-csv"></table>'
    }
    var head = rows[0]
    var body = rows.slice(1)
    var html = '<table class="md-csv"><thead><tr>'
    head.forEach((cell) => {
      html += '<th>' + escapeHtml(cell) + '</th>'
    })
    html += '</tr></thead><tbody>'
    body.forEach((row) => {
      html += '<tr>'
      head.forEach((_, index) => {
        html += '<td>' + escapeHtml(row[index] != null ? row[index] : '') + '</td>'
      })
      html += '</tr>'
    })
    html += '</tbody></table>'
    return html
  }

  return {
    render: () => {
      var blocks = walkBlocks(state.html)

      Array.from(document.querySelectorAll(
        'pre code.csv, pre code.tsv, pre code.language-csv, pre code.language-tsv'
      )).forEach((block, index) => {
        try {
          var match = blocks[index]
          var kind = match ? match.kind : block.classList.contains('tsv') ? 'tsv' : 'csv'
          var raw = decodeHtml((match ? match.raw : block.textContent).trim())
          raw = raw.replace(/^\uFEFF/, '').trim()
          var rows = parseTable(raw, kind === 'tsv' ? '\t' : ',')
          var host = document.createElement('div')
          host.className = 'md-table-wrap md-copy-host'
          host.dataset.mdCopySource = raw
          host.dataset.mdKind = kind
          host.innerHTML = tableHtml(rows)
          attachTableControls(host, rows)
          host.__mdGetCopyText = () => {
            if (host.classList.contains('md-table-modified')) {
              var tableEl = host.querySelector('table')
              return tableEl ? serializeTableDom(tableEl, kind) : raw
            }
            return host.dataset.mdCopySource || raw
          }
          block.parentElement.replaceWith(host)
        }
        catch (err) {
          console.error('Failed to render CSV/TSV table:', err)
        }
      })

      loaded = true
    }
  }
})()
