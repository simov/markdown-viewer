;(() => {
  // ─── STATE ────────────────────────────────────────────────────

  var comments = []
  var pendingSelection = null
  var sidebarVisible = false
  var closeSidebarOnClick = true
  var pageUrl = location.href
  var authorName = ''
  var filters = {status: 'all', tag: 'all', severity: 'all'}
  var searchQuery = ''
  var editingId = null
  var replyingId = null
  var showingInput = false
  var showingTooltip = null // {top, left} or null
  // `args` is set globally by background/inject.js before this script runs.
  // Fall back to write-enabled if unavailable (e.g. loaded standalone/tests).
  var writeEnabled = (typeof args !== 'undefined' && args.content)
    ? !!args.content.commentsWrite
    : true

  var TAGS = ['note', 'question', 'suggestion', 'issue', 'outdated', 'action-needed']
  var SEVERITIES = ['low', 'medium', 'high', 'critical']

  // ─── SANITIZATION HELPERS ───────────────────────────────────────
  // Only allow known-good values through to CSS class names / attributes.
  // Anything imported from JSON or parsed from inline comments passes
  // through these before being trusted anywhere.

  function sanitizeTag (tag) {
    return TAGS.indexOf(tag) !== -1 ? tag : null
  }

  function sanitizeSeverity (severity) {
    return SEVERITIES.indexOf(severity) !== -1 ? severity : null
  }

  function sanitizeId (id, prefix) {
    return (typeof id === 'string' && /^[\w-]+$/.test(id))
      ? id
      : (prefix || 'id_') + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
  }

  function sanitizeComment (c) {
    if (!c || typeof c !== 'object') return null
    return {
      id: sanitizeId(c.id, 'imp_'),
      anchor: {
        text: typeof c.anchor?.text === 'string' ? c.anchor.text.substring(0, 200) : '',
        prefix: typeof c.anchor?.prefix === 'string' ? c.anchor.prefix.substring(0, 30) : '',
        suffix: typeof c.anchor?.suffix === 'string' ? c.anchor.suffix.substring(0, 30) : '',
        heading: typeof c.anchor?.heading === 'string' ? c.anchor.heading.substring(0, 200) : ''
      },
      body: typeof c.body === 'string' ? c.body : '',
      author: typeof c.author === 'string' ? c.author.substring(0, 100) : null,
      tag: sanitizeTag(c.tag),
      severity: sanitizeSeverity(c.severity),
      suggestion: typeof c.suggestion === 'string' ? c.suggestion : null,
      replies: Array.isArray(c.replies) ? c.replies.map(sanitizeReply).filter(Boolean) : [],
      createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString(),
      updatedAt: typeof c.updatedAt === 'string' ? c.updatedAt : null,
      resolved: !!c.resolved,
      _fromInline: !!c._fromInline
    }
  }

  function sanitizeReply (r) {
    if (!r || typeof r !== 'object') return null
    return {
      id: sanitizeId(r.id, 'r_'),
      author: typeof r.author === 'string' ? r.author.substring(0, 100) : null,
      body: typeof r.body === 'string' ? r.body : '',
      createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString()
    }
  }

  // ─── INITIALIZATION ───────────────────────────────────────────

  function init () {
    loadAuthor()
    loadComments()
    if (writeEnabled) {
      setupKeyboardShortcut()
      setupSelectionListener()
      setupMessageListener()
    } else {
      setupNavigationShortcut()
      setupCloseOnClickListener()
    }
    mountUi()
    createToggleButton()
    watchContentReplacement()
  }

  // ─── STORAGE ──────────────────────────────────────────────────

  function loadAuthor () {
    chrome.storage.sync.get(['commentsAuthor', 'commentsCloseOnClick'], (res) => {
      authorName = res.commentsAuthor || ''
      closeSidebarOnClick = res.commentsCloseOnClick !== false // default true
    })
  }

  function loadComments () {
    chrome.runtime.sendMessage({
      message: 'comments.load',
      url: pageUrl
    }, (res) => {
      // Distinguish "background responded with zero comments" from
      // "background didn't respond" (e.g. MV3 service worker was asleep
      // and sendMessage resolved with undefined, or chrome.runtime.lastError
      // was set). Treating the latter as "stored = []" would cause the
      // merge below to silently overwrite real stored comments.
      if (chrome.runtime.lastError || !res) {
        console.error('[comments] failed to load stored comments, skipping merge/save:', chrome.runtime.lastError)
        comments = parseInlineComments()
        renderHighlights()
        redraw()
        updateBadge()
        return
      }

      var stored = Array.isArray(res.comments) ? res.comments.map(sanitizeComment).filter(Boolean) : []
      var inline = parseInlineComments()
      comments = mergeComments(stored, inline)
      if (comments.length > stored.length) {
        // Persist merged result so inline comments are editable
        saveComments()
      }
      renderHighlights()
      redraw()
      updateBadge()
    })
  }

  function parseInlineComments () {
    // The original <pre> may have been replaced by Mithril's mount.
    // Try to read it first; if empty, fetch the raw file.
    var pre = document.querySelector('pre')
    var source = pre ? (pre.textContent || pre.innerText || '') : ''

    if (source && source.includes('<!-- COMMENT')) {
      return parseInlineFromSource(source)
    }

    // If pre is gone or empty, fetch the raw file asynchronously
    if (location.protocol === 'file:') {
      chrome.runtime.sendMessage({
        message: 'autoreload',
        location: pageUrl
      }, (res) => {
        if (res && !res.err && res.body && res.body.includes('<!-- COMMENT')) {
          var inline = parseInlineFromSource(res.body)
          if (inline.length > 0) {
            var storedIds = new Set(comments.map((c) => c.id))
            var storedAnchors = new Set(comments.map((c) => c.anchor.text + '|||' + c.body))
            var newOnes = inline.filter((c) => !storedIds.has(c.id) && !storedAnchors.has(c.anchor.text + '|||' + c.body))
            if (newOnes.length > 0) {
              comments = comments.concat(newOnes)
              saveComments()
              renderHighlights()
              redraw()
              updateBadge()
            }
          }
        }
      })
    }
    return []
  }

  function parseInlineFromSource (source) {
    var results = []
    var regex = /<!-- COMMENT(\s*\[RESOLVED\])?: ([\s\S]*?) -->/g
    var match

    while ((match = regex.exec(source)) !== null) {
      var resolved = !!match[1]
      var body = match[2].replace(/—/g, '--')

      var commentStart = match.index
      var commentEnd = commentStart + match[0].length

      // Grab text before the comment on the same line
      var beforeChunk = source.substring(Math.max(0, commentStart - 100), commentStart)
      var lastNewline = beforeChunk.lastIndexOf('\n')
      var lineBeforeComment = lastNewline >= 0 ? beforeChunk.substring(lastNewline + 1) : beforeChunk

      // Grab text after the comment (up to 50 chars, stop at newline)
      var afterChunk = source.substring(commentEnd, commentEnd + 50)
      var firstNewline = afterChunk.indexOf('\n')
      var lineAfterComment = firstNewline >= 0 ? afterChunk.substring(0, firstNewline) : afterChunk

      // Use text before comment as anchor (strip markdown syntax)
      var anchorText = lineBeforeComment.replace(/[#*_`>\[\]|]/g, '').trim()
      if (anchorText.length < 3) {
        anchorText = lineAfterComment.replace(/[#*_`>\[\]|]/g, '').trim()
      }
      if (anchorText.length < 3) continue

      // Prefix for disambiguation
      var prefixStart = Math.max(0, commentStart - 130)
      var prefixChunk = source.substring(prefixStart, Math.max(0, commentStart - 100))
      var prefix = prefixChunk.replace(/[#*_`>\[\]|]/g, '').trim()

      // Find nearest heading above
      var heading = ''
      var beforeAll = source.substring(0, commentStart)
      var headingMatches = beforeAll.match(/^#{1,6}\s+.+$/gm)
      if (headingMatches) heading = headingMatches[headingMatches.length - 1].replace(/^#+\s*/, '')

      results.push(sanitizeComment({
        id: 'inline_' + hashCode(anchorText + body),
        anchor: {
          text: anchorText.substring(0, 200),
          prefix: prefix.substring(0, 30),
          suffix: lineAfterComment.replace(/[#*_`>\[\]|]/g, '').trim().substring(0, 30),
          heading: heading
        },
        body: body.trim(),
        author: null,
        tag: null,
        severity: null,
        suggestion: null,
        replies: [],
        createdAt: new Date().toISOString(),
        updatedAt: null,
        resolved: resolved,
        _fromInline: true
      }))
    }
    return results
  }

  function mergeComments (stored, inline) {
    if (!inline.length) return stored
    if (!stored.length) return inline

    // Merge: stored comments take priority (user may have edited them)
    var storedIds = new Set(stored.map((c) => c.id))
    var newInline = inline.filter((c) => !storedIds.has(c.id))

    // Also check by anchor text to avoid duplicating if ID format differs
    var storedAnchors = new Set(stored.map((c) => c.anchor.text + '|||' + c.body))
    var deduped = newInline.filter((c) => !storedAnchors.has(c.anchor.text + '|||' + c.body))

    return stored.concat(deduped)
  }

  function hashCode (str) {
    var hash = 0
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + ch
      hash |= 0
    }
    return Math.abs(hash).toString(36)
  }

  function saveComments () {
    // Strip internal edit/reply scratch fields (_draftBody/_draftReply)
    // before persisting — they're only used for the controlled-textarea
    // pattern in renderEditBox/renderReplyBox and should never reach
    // storage, e.g. if a user abandons an edit without pressing Escape.
    var toPersist = comments.map((c) => {
      var clean = Object.assign({}, c)
      delete clean._draftBody
      delete clean._draftReply
      return clean
    })
    chrome.runtime.sendMessage({
      message: 'comments.save',
      url: pageUrl,
      comments: toPersist
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('[comments] failed to save comments:', chrome.runtime.lastError)
      }
    })
    updateBadge()
  }

  // ─── SELECTION HANDLING ───────────────────────────────────────

  function setupSelectionListener () {
    document.addEventListener('mouseup', (e) => {
      if (e.target.closest('#_comments-sidebar') || e.target.closest('#_comments-input') || e.target.closest('#_comments-tooltip')) {
        return
      }
      showingTooltip = null
      var sel = window.getSelection()
      if (sel && sel.toString().trim().length > 0) {
        pendingSelection = captureSelection(sel)
        showingTooltip = {top: e.pageY - 40, left: e.pageX}
        redraw()
      } else {
        redraw()
      }
    })
    setupCloseOnClickListener()
  }

  function setupCloseOnClickListener () {
    document.addEventListener('mousedown', (e) => {
      if (!e.target.closest('#_comments-tooltip')) {
        if (showingTooltip) { showingTooltip = null; redraw() }
      }
      // Close sidebar on click in document (not on our UI elements)
      if (sidebarVisible && closeSidebarOnClick
          && !e.target.closest('#_comments-sidebar')
          && !e.target.closest('#_comments-toggle')
          && !e.target.closest('#_comments-input')
          && !e.target.closest('#_comments-tooltip')
          && !e.target.closest('mark._comment-highlight')) {
        hideSidebar()
      }
    })
  }

  function setupKeyboardShortcut () {
    document.addEventListener('keydown', (e) => {
      // Cmd+Shift+K — add comment (write mode only; init() only calls this fn when writeEnabled)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault()
        e.stopPropagation()
        var sel = window.getSelection()
        if (sel && sel.toString().trim().length > 0) {
          pendingSelection = captureSelection(sel)
          showCommentInput()
        }
      }
    })
    setupNavigationShortcut()
  }

  function setupNavigationShortcut () {
    document.addEventListener('keydown', (e) => {
      // Ctrl+] — next comment
      if (e.ctrlKey && e.key === ']') {
        e.preventDefault()
        navigateComment(1)
      }
      // Ctrl+[ — previous comment
      if (e.ctrlKey && e.key === '[') {
        e.preventDefault()
        navigateComment(-1)
      }
    })
  }

  function setupMessageListener () {
    chrome.runtime.onMessage.addListener((req) => {
      if (req.message === 'comments.add-from-menu') {
        if (pendingSelection) showCommentInput()
      }
    })
  }

  function captureSelection (sel) {
    var range = sel.getRangeAt(0)
    var text = sel.toString().trim()
    var container = range.commonAncestorContainer
    var fullText = (container.textContent || '')
    var startOffset = fullText.indexOf(text)
    var prefix = fullText.substring(Math.max(0, startOffset - 30), startOffset)
    var suffix = fullText.substring(startOffset + text.length, startOffset + text.length + 30)

    var heading = ''
    var node = range.startContainer
    while (node && node !== document.body) {
      if (node.previousElementSibling) {
        var prev = node.previousElementSibling
        if (/^H[1-6]$/.test(prev.tagName)) {
          heading = prev.textContent
          break
        }
      }
      node = node.parentElement
    }

    var rect = range.getBoundingClientRect()
    return {
      text: text.substring(0, 200),
      prefix: prefix,
      suffix: suffix,
      heading: heading,
      rect: {top: rect.top + window.scrollY, left: rect.left}
    }
  }

  // ─── HIGHLIGHTS ───────────────────────────────────────────────

  var anchoredIds = new Set()
  var applyingHighlights = false

  function renderHighlights () {
    applyingHighlights = true
    document.querySelectorAll('mark._comment-highlight').forEach((el) => el.replaceWith(...el.childNodes))
    anchoredIds.clear()
    comments.forEach((comment) => {
      if (comment.resolved) return
      if (highlightText(comment)) {
        anchoredIds.add(comment.id)
      }
    })
    redraw() // orphan/anchored state in the sidebar may have changed
    // Let the DOM settle before re-arming mutation detection, so our
    // own <mark> insertions/removals above don't re-trigger the observer.
    requestAnimationFrame(() => { applyingHighlights = false })
  }

  // content/index.js's own Mithril app rebuilds #_html/#_markdown from
  // scratch on autoreload, theme switch, and raw-view toggle (m.trust()
  // replaces the whole subtree), destroying our <mark> elements each
  // time with no callback into this script. Watch for that and
  // re-apply highlights rather than leaving them silently gone.
  var highlightObserver = null

  function watchContentReplacement () {
    var content = document.getElementById('_html') || document.getElementById('_markdown')
    if (!content || !content.parentElement) return

    var debounceTimer = null
    highlightObserver = new MutationObserver(() => {
      if (applyingHighlights) return // ignore mutations caused by our own renderHighlights()
      // A single Mithril re-render can fire multiple mutation records;
      // coalesce into one renderHighlights() call.
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(renderHighlights, 50)
    })
    // Observe the parent, since #_html/#_markdown itself may be replaced
    // wholesale (not just mutated) on theme/raw toggles.
    highlightObserver.observe(content.parentElement, {childList: true, subtree: true})
  }

  function highlightText (comment) {
    var content = document.getElementById('_html') || document.getElementById('_markdown')
    if (!content) return false

    var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null)
    var searchText = comment.anchor.text
    var node

    while ((node = walker.nextNode())) {
      var idx = node.textContent.indexOf(searchText)
      if (idx === -1) continue

      var parentText = node.parentElement.textContent || ''
      if (comment.anchor.prefix && !parentText.includes(comment.anchor.prefix + searchText)) {
        if (comment.anchor.suffix && !parentText.includes(searchText + comment.anchor.suffix)) {
          continue
        }
      }

      if (highlightWithinSingleNode(node, idx, searchText, comment)) return true
      // surroundContents() threw for this single-node match (shouldn't
      // normally happen for a genuinely single-node range, but fall
      // through to the cross-node path defensively rather than give up).
      break
    }

    // No single text node contains the full anchor text — this is the
    // common case for anchors that span an inline element boundary
    // (bold/code/link). Search across node boundaries instead.
    return highlightAcrossNodes(content, searchText, comment)
  }

  function highlightWithinSingleNode (node, idx, searchText, comment) {
    var range = document.createRange()
    range.setStart(node, idx)
    range.setEnd(node, Math.min(idx + searchText.length, node.textContent.length))

    var mark = document.createElement('mark')
    mark.className = '_comment-highlight'
    if (comment.severity) mark.classList.add('_severity-' + comment.severity)
    mark.dataset.commentId = comment.id
    mark.addEventListener('click', () => {
      showSidebar()
      scrollSidebarTo(comment.id)
    })

    try {
      range.surroundContents(mark)
      return true
    } catch (e) {
      // Range spans multiple elements (e.g. crosses a <strong>/<code>/<a>
      // boundary) — surroundContents() cannot wrap a partial multi-element
      // range. Caller falls back to highlightAcrossNodes().
      return false
    }
  }

  // Fallback for anchors that span more than one text node/element.
  // Finds all text nodes under `root` that together contain `searchText`
  // (allowing it to cross element boundaries) and wraps each node's
  // matching segment individually, rather than requiring a single
  // contiguous Range.surroundContents() call.
  function highlightAcrossNodes (root, searchText, comment) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
    var textNodes = []
    var node
    while ((node = walker.nextNode())) textNodes.push(node)

    var combined = textNodes.map((n) => n.textContent).join('')
    var start = combined.indexOf(searchText)
    if (start === -1) return false
    var end = start + searchText.length

    var wrapped = []
    var pos = 0
    for (var i = 0; i < textNodes.length; i++) {
      var n = textNodes[i]
      var len = n.textContent.length
      var nodeStart = pos
      var nodeEnd = pos + len
      pos += len

      var overlapStart = Math.max(start, nodeStart)
      var overlapEnd = Math.min(end, nodeEnd)
      if (overlapStart >= overlapEnd) continue // no overlap with this node

      var localStart = overlapStart - nodeStart
      var localEnd = overlapEnd - nodeStart

      try {
        var range = document.createRange()
        range.setStart(n, localStart)
        range.setEnd(n, localEnd)
        var mark = document.createElement('mark')
        mark.className = '_comment-highlight'
        if (comment.severity) mark.classList.add('_severity-' + comment.severity)
        mark.dataset.commentId = comment.id
        mark.addEventListener('click', () => {
          showSidebar()
          scrollSidebarTo(comment.id)
        })
        range.surroundContents(mark)
        wrapped.push(mark)
      } catch (e) {
        // A single text-node segment should never throw (it's always a
        // simple, single-node range), but guard anyway rather than
        // leaving a partially-wrapped anchor.
        return wrapped.length > 0
      }
    }
    return wrapped.length > 0
  }

  // ─── KEYBOARD NAVIGATION ──────────────────────────────────────

  var navIndex = -1

  function navigateComment (direction) {
    var open = comments.filter((c) => !c.resolved)
    if (!open.length) return
    navIndex = (navIndex + direction + open.length) % open.length
    var c = open[navIndex]
    scrollToHighlight(c.id)
    showSidebar()
    scrollSidebarTo(c.id)
  }

  // ─── MITHRIL UI ───────────────────────────────────────────────
  // Everything that renders comment content (body, tag, severity, id,
  // author, replies, anchor text) goes through Mithril's `m()`, which
  // treats all non-`m.trust()` children as text nodes and escapes them
  // by construction. There is no innerHTML template-string surface here
  // for a stray unescaped field to slip through.

  var uiRoot = null

  function mountUi () {
    // content/index.js does `m.mount($('body'), {...})`, which means
    // Mithril owns and fully diffs body's children on every redraw
    // (theme switch, autoreload, raw toggle, etc). Any DOM node we append
    // as a child of <body> that isn't part of that app's own vnode tree
    // gets silently removed on its next redraw. Mount as a sibling of
    // <body> instead (a child of <html>) so it's outside that app's
    // managed subtree entirely.
    uiRoot = document.createElement('div')
    uiRoot.id = '_comments-ui-root'
    document.documentElement.appendChild(uiRoot)
    m.mount(uiRoot, {view: renderUi})
  }

  function redraw () {
    if (uiRoot) m.redraw()
  }

  function renderUi () {
    return [
      renderTooltip(),
      showingInput && renderCommentInput(),
      renderSidebarPanel()
    ]
  }

  function renderTooltip () {
    if (!showingTooltip) return null
    return m('div#_comments-tooltip', {
      style: {top: showingTooltip.top + 'px', left: showingTooltip.left + 'px'},
      onclick: () => {
        showingTooltip = null
        showCommentInput()
      }
    }, '💬 Comment')
  }

  function showCommentInput () {
    showingTooltip = null
    showingInput = true
    inputDraft = {body: '', tag: '', severity: '', suggestOn: false, suggestion: ''}
    redraw()
  }

  function removeCommentInput () {
    showingInput = false
    pendingSelection = null
    redraw()
  }

  var inputDraft = {body: '', tag: '', severity: '', suggestOn: false, suggestion: ''}

  function renderCommentInput () {
    if (!pendingSelection) return null
    var top = pendingSelection.rect.top + 30
    var label = pendingSelection.text.substring(0, 50) + (pendingSelection.text.length > 50 ? '…' : '')

    return m('div#_comments-input', {style: {top: top + 'px'}},
      m('div._comments-input-header',
        m('span', 'Comment on: ', m('em', '"' + label + '"'))
      ),
      m('textarea._comments-input-textarea', {
        rows: 3,
        placeholder: 'Type your comment...',
        value: inputDraft.body,
        oncreate: (vnode) => vnode.dom.focus(),
        oninput: (e) => { inputDraft.body = e.target.value },
        onkeydown: (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); saveNewComment() }
          if (e.key === 'Escape') removeCommentInput()
        }
      }),
      m('div._comments-input-options',
        m('select._comments-input-tag', {
          title: 'Tag (optional)',
          value: inputDraft.tag,
          onchange: (e) => { inputDraft.tag = e.target.value }
        },
          m('option', {value: ''}, '— tag —'),
          TAGS.map((t) => m('option', {value: t}, t))
        ),
        m('select._comments-input-severity', {
          title: 'Severity (optional)',
          value: inputDraft.severity,
          onchange: (e) => { inputDraft.severity = e.target.value }
        },
          m('option', {value: ''}, '— severity —'),
          SEVERITIES.map((s) => m('option', {value: s}, s))
        ),
        m('label._comments-input-suggest-label',
          m('input[type=checkbox]._comments-input-suggest-toggle', {
            checked: inputDraft.suggestOn,
            onchange: (e) => { inputDraft.suggestOn = e.target.checked }
          }),
          ' Suggest replacement'
        )
      ),
      inputDraft.suggestOn && m('textarea._comments-input-suggestion', {
        rows: 2,
        placeholder: 'Suggested replacement text...',
        value: inputDraft.suggestion,
        oncreate: (vnode) => vnode.dom.focus(),
        oninput: (e) => { inputDraft.suggestion = e.target.value },
        onkeydown: (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); saveNewComment() }
          if (e.key === 'Escape') removeCommentInput()
        }
      }),
      m('div._comments-input-actions',
        m('button._comments-btn-save', {onclick: saveNewComment}, 'Save (⌘↵)'),
        m('button._comments-btn-cancel', {onclick: removeCommentInput}, 'Cancel')
      )
    )
  }

  function saveNewComment () {
    var body = inputDraft.body.trim()
    if (!body || !pendingSelection) return

    var comment = {
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      anchor: {
        text: pendingSelection.text,
        prefix: pendingSelection.prefix,
        suffix: pendingSelection.suffix,
        heading: pendingSelection.heading
      },
      body: body,
      author: authorName || null,
      tag: sanitizeTag(inputDraft.tag) || null,
      severity: sanitizeSeverity(inputDraft.severity) || null,
      suggestion: inputDraft.suggestOn ? (inputDraft.suggestion.trim() || null) : null,
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: null,
      resolved: false
    }

    comments.push(comment)
    saveComments()
    removeCommentInput()
    renderHighlights()
    redraw()
    window.getSelection().removeAllRanges()
  }

  // ─── SIDEBAR ──────────────────────────────────────────────────

  function toggleSidebar () { sidebarVisible ? hideSidebar() : showSidebar() }
  function showSidebar () { sidebarVisible = true; redraw() }
  function hideSidebar () { sidebarVisible = false; redraw() }

  function createToggleButton () {
    var btn = document.createElement('button')
    btn.id = '_comments-toggle'
    btn.title = 'Toggle Comments Panel (Ctrl+] / Ctrl+[ to navigate)'
    btn.textContent = '💬'
    btn.addEventListener('click', toggleSidebar)
    // Same reasoning as mountUi(): append outside <body> since the main
    // app's m.mount($('body'), ...) would otherwise strip this on redraw.
    document.documentElement.appendChild(btn)
  }

  function getFilteredComments () {
    return comments.filter((c) => {
      if (filters.status === 'open' && c.resolved) return false
      if (filters.status === 'resolved' && !c.resolved) return false
      if (filters.tag !== 'all' && c.tag !== filters.tag) return false
      if (filters.severity !== 'all' && c.severity !== filters.severity) return false
      if (searchQuery) {
        var hay = [c.body, c.anchor.text, c.tag || '', c.author || '', c.suggestion || ''].join(' ').toLowerCase()
        if (!hay.includes(searchQuery)) return false
      }
      return true
    })
  }

  function renderSidebarPanel () {
    return m('div#_comments-sidebar', {class: sidebarVisible ? '_visible' : ''},
      renderSidebarHeader(),
      renderSidebarFilters(),
      m('div._comments-sidebar-body', renderSidebarBody())
    )
  }

  function renderSidebarHeader () {
    var openCount = comments.filter((c) => !c.resolved).length
    return m('div._comments-sidebar-header',
      m('span._comments-title', 'Comments ',
        m('span._comments-badge', {style: {display: openCount > 0 ? 'inline' : 'none'}}, String(openCount))
      ),
      m('div._comments-sidebar-actions',
        writeEnabled && m('button._comments-btn-import', {title: 'Import comments from a JSON file', onclick: importComments}, '⬆'),
        writeEnabled && m('button._comments-btn-resolve-all', {title: 'Resolve all comments', onclick: resolveAll}, '✓ All'),
        writeEnabled && m('button._comments-btn-delete-all', {title: 'Delete all comments', onclick: deleteAll}, '🗑 All'),
        m('button._comments-btn-export-json', {title: 'Download comments as structured JSON data file', onclick: exportCommentsJson}, '⬇ JSON'),
        m('button._comments-btn-export-md', {title: 'Download markdown file with comments embedded as HTML comments', onclick: exportCommentsMd}, '⬇ MD'),
        m('button._comments-btn-close', {title: 'Close comments panel', onclick: hideSidebar}, '✕')
      )
    )
  }

  function renderSidebarFilters () {
    return m('div._comments-sidebar-filters',
      m('input._comments-search[type=text]', {
        placeholder: 'Search comments...',
        title: 'Search comment text, tags, authors',
        value: searchQuery,
        oninput: (e) => { searchQuery = e.target.value.toLowerCase(); redraw() }
      }),
      m('div._comments-filter-row',
        m('select._comments-filter-status', {
          title: 'Filter by status',
          value: filters.status,
          onchange: (e) => { filters.status = e.target.value; redraw() }
        },
          m('option', {value: 'all'}, 'All'),
          m('option', {value: 'open'}, 'Open'),
          m('option', {value: 'resolved'}, 'Resolved')
        ),
        m('select._comments-filter-tag', {
          title: 'Filter by tag',
          value: filters.tag,
          onchange: (e) => { filters.tag = e.target.value; redraw() }
        },
          m('option', {value: 'all'}, 'All tags'),
          TAGS.map((t) => m('option', {value: t}, t))
        ),
        m('select._comments-filter-severity', {
          title: 'Filter by severity',
          value: filters.severity,
          onchange: (e) => { filters.severity = e.target.value; redraw() }
        },
          m('option', {value: 'all'}, 'All severity'),
          SEVERITIES.map((s) => m('option', {value: s}, s))
        )
      )
    )
  }

  function renderSidebarBody () {
    if (comments.length === 0) {
      return m('div._comments-empty',
        'No comments yet.', m('br'),
        'Select text and click the 💬 tooltip,', m('br'),
        'or press ', m('kbd', '⌘⇧K'), ' to add a comment.'
      )
    }

    var filtered = getFilteredComments()
    if (filtered.length === 0) {
      return m('div._comments-empty', 'No comments match current filters.')
    }

    return filtered.map(renderCommentItem)
  }

  function renderCommentItem (c) {
    var isOrphan = !c.resolved && !anchoredIds.has(c.id)
    var isEditing = editingId === c.id
    var isReplying = replyingId === c.id

    return m('div._comments-item', {
      key: c.id,
      class: [c.resolved && '_resolved', isOrphan && '_orphan'].filter(Boolean).join(' '),
      'data-id': c.id,
      onclick: () => scrollToHighlight(c.id)
    },
      m('div._comments-item-pills',
        isOrphan && m('span._pill._pill-orphan', {title: 'Anchor text not found in document'}, '⚠️ unanchored'),
        c.tag && m('span._pill._pill-tag', {class: '_pill-' + c.tag}, c.tag),
        c.severity && m('span._pill._pill-severity', {class: '_pill-' + c.severity}, c.severity)
      ),
      m('div._comments-item-anchor', {title: c.anchor.text},
        '"' + c.anchor.text.substring(0, 60) + (c.anchor.text.length > 60 ? '…' : '') + '"'
      ),
      isOrphan && c.anchor.heading && m('div._comments-item-hint', 'Was near: ' + c.anchor.heading),
      isEditing ? renderEditBox(c) : m('div._comments-item-body', renderLinkified(c.body)),
      c.suggestion && m('div._comments-item-suggestion',
        m('span._suggestion-label', 'Suggestion:'), ' ',
        m('del', c.anchor.text.substring(0, 80)), ' → ', m('ins', c.suggestion.substring(0, 80))
      ),
      c.replies && c.replies.length > 0 && m('div._comments-replies',
        c.replies.map((r) => m('div._comments-reply', {key: r.id},
          m('strong', (r.author || 'Anonymous') + ':'), ' ',
          renderLinkified(r.body), ' ',
          m('span._comments-reply-date', formatDate(r.createdAt))
        ))
      ),
      isReplying && renderReplyBox(c),
      m('div._comments-item-meta',
        m('span._comments-item-date', (c.author ? c.author + ' · ' : '') + formatDate(c.createdAt)),
        writeEnabled && !isEditing && m('span._comments-item-actions',
          m('button._comments-btn-reply', {title: 'Reply', onclick: (e) => { e.stopPropagation(); replyingId = replyingId === c.id ? null : c.id; redraw() }}, '↩'),
          m('button._comments-btn-edit', {title: 'Edit', onclick: (e) => { e.stopPropagation(); editingId = c.id; redraw() }}, '✎'),
          c.resolved
            ? m('button._comments-btn-unresolve', {title: 'Reopen', onclick: (e) => { e.stopPropagation(); unresolveComment(c.id) }}, '↺')
            : m('button._comments-btn-resolve', {title: 'Resolve', onclick: (e) => { e.stopPropagation(); resolveComment(c.id) }}, '✓'),
          m('button._comments-btn-delete', {title: 'Delete', onclick: (e) => { e.stopPropagation(); deleteComment(c.id) }}, '✕')
        )
      )
    )
  }

  // Renders text with bare https?:// URLs turned into clickable links.
  // Operates on plain (unescaped) text and returns an array of Mithril
  // vnodes/strings — escaping is handled by Mithril itself since none of
  // the pieces are passed through m.trust().
  function renderLinkified (text) {
    var parts = String(text || '').split(/(https?:\/\/[^\s<]+)/g)
    return parts.map((part, i) =>
      /^https?:\/\//.test(part)
        ? m('a', {key: i, href: encodeURI(part), target: '_blank', rel: 'noopener'}, part)
        : part
    )
  }

  function renderEditBox (c) {
    if (c._draftBody === undefined) c._draftBody = c.body
    return m('div._comments-item-body',
      m('textarea._comments-edit-textarea', {
        value: c._draftBody,
        oncreate: (vnode) => {
          vnode.dom.focus()
          vnode.dom.setSelectionRange(vnode.dom.value.length, vnode.dom.value.length)
        },
        oninput: (e) => { c._draftBody = e.target.value },
        onkeydown: (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); commitEdit(c) }
          if (e.key === 'Escape') { delete c._draftBody; editingId = null; redraw() }
        }
      }),
      m('div._comments-edit-actions',
        m('button._comments-edit-save', {onclick: () => commitEdit(c)}, 'Save'),
        m('button._comments-edit-cancel', {onclick: () => { delete c._draftBody; editingId = null; redraw() }}, 'Cancel')
      )
    )
  }

  function commitEdit (c) {
    var v = (c._draftBody !== undefined ? c._draftBody : c.body).trim()
    if (v) { c.body = v; c.updatedAt = new Date().toISOString(); saveComments() }
    delete c._draftBody
    editingId = null
    redraw()
  }

  function renderReplyBox (c) {
    if (c._draftReply === undefined) c._draftReply = ''
    return m('div._comments-reply-input',
      m('textarea._comments-reply-textarea', {
        rows: 2,
        placeholder: 'Reply...',
        value: c._draftReply,
        oncreate: (vnode) => vnode.dom.focus(),
        oninput: (e) => { c._draftReply = e.target.value },
        onkeydown: (e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); commitReply(c) }
          if (e.key === 'Escape') { delete c._draftReply; replyingId = null; redraw() }
        }
      }),
      m('div._comments-edit-actions',
        m('button._comments-reply-save', {onclick: () => commitReply(c)}, 'Reply'),
        m('button._comments-reply-cancel', {onclick: () => { delete c._draftReply; replyingId = null; redraw() }}, 'Cancel')
      )
    )
  }

  function commitReply (c) {
    var v = (c._draftReply || '').trim()
    if (v) {
      if (!c.replies) c.replies = []
      c.replies.push({
        id: 'r_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        author: authorName || null,
        body: v,
        createdAt: new Date().toISOString()
      })
      saveComments()
    }
    delete c._draftReply
    replyingId = null
    redraw()
  }

  function scrollSidebarTo (commentId) {
    // Wait a tick for Mithril to render the sidebar (e.g. after showSidebar())
    requestAnimationFrame(() => {
      var item = document.querySelector('._comments-item[data-id="' + commentId + '"]')
      if (item) {
        item.scrollIntoView({behavior: 'smooth', block: 'center'})
        item.classList.add('_flash')
        setTimeout(() => item.classList.remove('_flash'), 1000)
      }
    })
  }

  function scrollToHighlight (commentId) {
    var mark = document.querySelector('mark[data-comment-id="' + commentId + '"]')
    if (mark) {
      // Force scroll by computing absolute position and scrolling directly
      var rect = mark.getBoundingClientRect()
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop
      var targetY = rect.top + scrollTop - (window.innerHeight / 2)
      window.scrollTo({top: targetY, behavior: 'smooth'})
      mark.classList.remove('_flash')
      void mark.offsetWidth // force reflow to restart animation
      mark.classList.add('_flash')
      setTimeout(() => mark.classList.remove('_flash'), 1000)
    }
  }

  // ─── COMMENT OPERATIONS ───────────────────────────────────────

  function resolveComment (id) {
    var c = comments.find((c) => c.id === id)
    if (c) { c.resolved = true; saveComments(); renderHighlights(); redraw() }
  }

  function unresolveComment (id) {
    var c = comments.find((c) => c.id === id)
    if (c) { c.resolved = false; saveComments(); renderHighlights(); redraw() }
  }

  function deleteComment (id) {
    comments = comments.filter((c) => c.id !== id)
    saveComments(); renderHighlights(); redraw()
  }

  function resolveAll () {
    var openCount = comments.filter((c) => !c.resolved).length
    if (!openCount) return
    if (!confirm('Resolve all ' + openCount + ' open comment(s)?')) return
    comments.forEach((c) => { c.resolved = true })
    saveComments(); renderHighlights(); redraw()
  }

  function deleteAll () {
    if (!comments.length) return
    if (!confirm('Delete all ' + comments.length + ' comment(s)?')) return
    comments = []
    saveComments(); renderHighlights(); redraw()
  }

  // ─── IMPORT / EXPORT ──────────────────────────────────────────

  function importComments () {
    var input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.addEventListener('change', (e) => {
      var file = e.target.files[0]
      if (!file) return
      var reader = new FileReader()
      reader.onload = () => {
        try {
          var data = JSON.parse(reader.result)
          var imported = data.comments || data
          if (!Array.isArray(imported)) { alert('Invalid comments file'); return }

          // All imported records pass through sanitizeComment() — untrusted
          // JSON can otherwise carry crafted id/tag/severity/author values.
          var sanitized = imported.map(sanitizeComment).filter(Boolean)

          var mode = comments.length > 0
            ? confirm('Merge with existing comments?\n\nOK = Merge\nCancel = Replace all')
            : true

          if (mode) {
            // Merge — skip duplicates by ID
            var existingIds = new Set(comments.map((c) => c.id))
            var newOnes = sanitized.filter((c) => !existingIds.has(c.id))
            comments = comments.concat(newOnes)
          } else {
            comments = sanitized
          }

          saveComments()
          renderHighlights()
          redraw()
        } catch (err) {
          alert('Failed to parse file: ' + err.message)
        }
      }
      reader.readAsText(file)
    })
    input.click()
  }

  function exportCommentsJson () {
    var filename = safeExportFilename('.comments.json')
    chrome.runtime.sendMessage({
      message: 'comments.export',
      url: pageUrl,
      filename: filename
    })
  }

  function exportCommentsMd () {
    var filename = safeExportFilename('.commented.md', true)
    chrome.runtime.sendMessage({
      message: 'comments.export-md',
      url: pageUrl,
      filename: filename,
      comments: comments
    })
  }

  function safeExportFilename (suffix, stripMd) {
    var base = 'document'
    try {
      var pathParts = new URL(pageUrl).pathname.split('/')
      base = pathParts[pathParts.length - 1] || 'document'
    } catch (e) {
      // Malformed/non-standard pageUrl (e.g. about:blank) — fall back
      // to a generic filename rather than throwing and breaking export.
    }
    if (stripMd) base = base.replace(/\.md$/i, '')
    return base + suffix
  }

  // ─── BADGE ────────────────────────────────────────────────────

  function updateBadge () {
    var count = comments.filter((c) => !c.resolved).length
    var toggle = document.getElementById('_comments-toggle')
    if (toggle) {
      toggle.textContent = count > 0 ? `💬 ${count}` : '💬'
    }
    // Extension icon badge
    chrome.runtime.sendMessage({message: 'comments.badge', count: count})
  }

  function formatDate (iso) {
    if (!iso) return ''
    var d = new Date(iso)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
  }

  // ─── BOOT ─────────────────────────────────────────────────────

  var bootAttempts = 0
  var bootInterval = setInterval(() => {
    if (document.getElementById('_html') || document.getElementById('_markdown')) {
      clearInterval(bootInterval)
      init()
      return
    }
    if (++bootAttempts > 50) { // ~5s cap
      clearInterval(bootInterval)
      console.warn('[comments] gave up waiting for #_html/#_markdown to render')
    }
  }, 100)
})()
