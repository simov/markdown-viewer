md.comments = ({storage: {state}}) => {

  // Register context menu. In an MV3 service worker this code re-runs on
  // every worker wake, and contextMenus.create() with a fixed id throws
  // "Cannot create item with duplicate id" on the second and later wakes.
  // Also, chrome.contextMenus can be undefined in the background context
  // (observed in Firefox for a temporary add-on even with the permission
  // declared). Because md.comments() is constructed BEFORE index.js
  // registers the onMessage/onUpdated listeners, any throw here aborts the
  // whole background startup and no listeners register — which surfaces as
  // "Could not establish connection. Receiving end does not exist", blank
  // settings, and files rendering as raw. The context menu is optional, so
  // guard the entire block: never let it break listener registration.
  if (chrome.contextMenus) {
    try {
      chrome.contextMenus.removeAll(() => {
        void chrome.runtime.lastError
        chrome.contextMenus.create({
          id: 'markdown-viewer-add-comment',
          title: 'Add Comment',
          contexts: ['selection'],
          documentUrlPatterns: ['file:///*']
        }, () => { void chrome.runtime.lastError })
      })

      // Handle context menu click
      chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === 'markdown-viewer-add-comment') {
          chrome.tabs.sendMessage(tab.id, {
            message: 'comments.add-from-menu',
            selectionText: info.selectionText
          })
        }
      })
    }
    catch (err) {
      // contextMenus unavailable — skip the menu, keep the background alive
      console.warn('[markdown-viewer] context menu unavailable:', err && err.message)
    }
  }

  // Handle comment storage messages
  return (req, sender, sendResponse) => {
    if (req.message === 'comments.load') {
      var key = 'comments:' + req.url
      chrome.storage.local.get(key, (res) => {
        sendResponse({comments: res[key] || []})
      })
      return true
    }

    else if (req.message === 'comments.save') {
      var key = 'comments:' + req.url
      chrome.storage.local.set({[key]: req.comments}, () => {
        sendResponse({ok: true})
      })
      return true
    }

    else if (req.message === 'comments.export') {
      var key = 'comments:' + req.url
      chrome.storage.local.get(key, (res) => {
        var comments = res[key] || []
        var filename = req.filename || 'comments.json'

        var exportData = {
          version: 1,
          source: req.url,
          exportedAt: new Date().toISOString(),
          comments: comments
        }

        // Create a data URL and trigger download
        var json = JSON.stringify(exportData, null, 2)
        var blob = new Blob([json], {type: 'application/json'})
        var reader = new FileReader()
        reader.onload = () => {
          chrome.downloads.download({
            url: reader.result,
            filename: filename,
            saveAs: true
          }, () => {
            sendResponse({ok: true})
          })
        }
        reader.readAsDataURL(blob)
      })
      return true
    }

    else if (req.message === 'comments.export-md') {
      // Fetch the raw markdown source, inject inline HTML comments, download as .md
      fetch(req.url)
        .then((res) => res.text())
        .then((markdown) => {
          var annotated = injectInlineComments(markdown, req.comments)
          var blob = new Blob([annotated], {type: 'text/markdown'})
          var reader = new FileReader()
          reader.onload = () => {
            chrome.downloads.download({
              url: reader.result,
              filename: req.filename,
              saveAs: true
            }, () => {
              sendResponse({ok: true})
            })
          }
          reader.readAsDataURL(blob)
        })
        .catch((err) => {
          sendResponse({ok: false, error: err.message})
        })
      return true
    }

    else if (req.message === 'comments.badge') {
      var text = req.count > 0 ? String(req.count) : ''
      chrome.action.setBadgeText({text: text, tabId: sender.tab.id})
      chrome.action.setBadgeBackgroundColor({color: '#2563eb', tabId: sender.tab.id})
      return false
    }

    else if (req.message === 'comments.clear') {
      var key = 'comments:' + req.url
      chrome.storage.local.remove(key, () => {
        sendResponse({ok: true})
      })
      return true
    }
  }

  function injectInlineComments (markdown, comments) {
    // Sort comments by position in the source (later first so insertions don't shift offsets)
    var sorted = comments
      .filter((c) => c.anchor && c.anchor.text)
      .map((c) => {
        var idx = findAnchorInSource(markdown, c.anchor)
        return {comment: c, idx: idx}
      })
      .filter((item) => item.idx >= 0)
      .sort((a, b) => b.idx - a.idx)

    var result = markdown
    sorted.forEach((item) => {
      var c = item.comment
      var anchorEnd = item.idx + c.anchor.text.length
      var status = c.resolved ? ' [RESOLVED]' : ''
      var commentTag = '<!-- COMMENT' + status + ': ' + c.body.replace(/--/g, '—') + ' -->'
      result = result.substring(0, anchorEnd) + commentTag + result.substring(anchorEnd)
    })

    return result
  }

  function findAnchorInSource (markdown, anchor) {
    // Try exact text match with prefix context
    if (anchor.prefix) {
      var withPrefix = anchor.prefix + anchor.text
      var idx = markdown.indexOf(withPrefix)
      if (idx >= 0) return idx + anchor.prefix.length
    }
    // Try exact text match with suffix context
    if (anchor.suffix) {
      var withSuffix = anchor.text + anchor.suffix
      var idx = markdown.indexOf(withSuffix)
      if (idx >= 0) return idx
    }
    // Fallback: plain text match
    return markdown.indexOf(anchor.text)
  }
}
