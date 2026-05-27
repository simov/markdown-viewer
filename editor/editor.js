/*
  Markdown WYSIWYG editor for the viewer.

  Runs at chrome-extension://.../editor/editor.html?path=<abs-fs-path>.
  Lives on a chrome-extension:// origin so the File System Access API works
  here — that API is blocked on file:// pages (opaque origin), which is why we
  can't host the editor inside the viewer page itself.

  Save flow (no per-file picker after the first grant):
    1. On Save, look for a cached FileSystemDirectoryHandle whose recorded
       absolute root path is an ancestor of the current file.
    2. If found, walk to the file and write — silent.
    3. Otherwise prompt showDirectoryPicker once. Infer which segment of the
       file's path the picked directory corresponds to (rightmost match on
       handle.name), cache it in IndexedDB, then write.

  Result: first save in any folder = one OS picker; every subsequent save to
  any file under that folder = zero prompts (one permission re-grant click per
  browser restart, since FSA permission state resets across sessions).
*/

const $ = (s) => document.querySelector(s)

const params = new URLSearchParams(location.search)
const FILE_PATH = params.get('path') || ''          // /Users/.../foo.md
const SOURCE_TAB = parseInt(params.get('tab') || '', 10) || null
const FILE_URL = 'file://' + FILE_PATH.split('/').map(encodeURIComponent).join('/')
const FILE_NAME = FILE_PATH.split('/').pop()

let editor = null
let dirty = false
let suppressChange = false
let resolvedFileHandle = null   // cached after the first successful resolve

function setTitle () {
  document.title = (dirty ? '• ' : '') + (FILE_NAME || 'Untitled') + ' — Editor'
}

function setDirty (d) {
  dirty = d
  setTitle()
  $('#btn-save').disabled = !d
}

function flash (text, ms = 1500) {
  const el = $('#status')
  el.textContent = text
  if (ms) setTimeout(() => { if (el.textContent === text) el.textContent = '' }, ms)
}

// ---------- IndexedDB: persisted directory handles ----------

const DB_NAME = 'mdv-editor'
const STORE = 'roots'

function openDB () {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'rootPath' })
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}

async function idbGetAll () {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE).objectStore(STORE).getAll()
    tx.onsuccess = () => res(tx.result || [])
    tx.onerror = () => rej(tx.error)
  })
}

async function idbPut (entry) {
  const db = await openDB()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite').objectStore(STORE).put(entry)
    tx.onsuccess = () => res()
    tx.onerror = () => rej(tx.error)
  })
}

// ---------- file-handle resolution ----------

async function ensurePerm (h, mode = 'readwrite') {
  if ((await h.queryPermission({ mode })) === 'granted') return true
  return (await h.requestPermission({ mode })) === 'granted'
}

// walk a relative path "a/b/foo.md" from a directory handle to a file handle.
async function walkToFile (dirHandle, relPath) {
  const parts = relPath.split('/').filter(Boolean)
  const filename = parts.pop()
  let h = dirHandle
  for (const part of parts) h = await h.getDirectoryHandle(part)
  return await h.getFileHandle(filename)
}

// "/a/b/c/foo.md" with dirName "b" -> { rootPath: "/a/b", rel: "c/foo.md" }
// uses the *rightmost* matching segment so deeper grants take precedence.
function inferRoot (absPath, dirName) {
  const segs = absPath.split('/')
  for (let i = segs.length - 2; i >= 0; i--) {
    if (segs[i] === dirName) {
      return { rootPath: segs.slice(0, i + 1).join('/'), rel: segs.slice(i + 1).join('/') }
    }
  }
  return null
}

async function getFileHandleFor (absPath) {
  if (resolvedFileHandle) {
    if (await ensurePerm(resolvedFileHandle)) return resolvedFileHandle
    resolvedFileHandle = null
  }

  // try every cached root that contains this file
  const roots = await idbGetAll()
  for (const { rootPath, handle } of roots) {
    if (absPath !== rootPath && absPath.indexOf(rootPath + '/') !== 0) continue
    if (!(await ensurePerm(handle))) continue
    try {
      const rel = absPath.slice(rootPath.length + 1)
      const fh = await walkToFile(handle, rel)
      resolvedFileHandle = fh
      $('#root').textContent = 'via ' + rootPath
      return fh
    } catch (err) {
      // stale handle or file moved — try the next root
    }
  }

  // need a fresh grant
  let dir
  try {
    dir = await window.showDirectoryPicker({ mode: 'readwrite' })
  } catch (err) {
    if (err.name === 'AbortError') return null
    throw err
  }

  const root = inferRoot(absPath, dir.name)
  if (!root) {
    alert(
      `The folder you picked ("${dir.name}") isn't on the path of this file.\n\n` +
      `File: ${absPath}\n\n` +
      `Pick a folder that's an ancestor of this file — usually the workspace root.`
    )
    return null
  }

  let fh
  try {
    fh = await walkToFile(dir, root.rel)
  } catch (err) {
    alert(
      `Couldn't locate "${root.rel}" inside the folder you picked.\n\n` +
      `Make sure you picked the right ancestor folder.\n\n(${err.message})`
    )
    return null
  }

  await idbPut({ rootPath: root.rootPath, handle: dir })
  resolvedFileHandle = fh
  $('#root').textContent = 'via ' + root.rootPath
  return fh
}

// ---------- editor lifecycle ----------

function initEditor (initialMarkdown) {
  suppressChange = true
  editor = new toastui.Editor({
    el: $('#editor'),
    height: 'calc(100vh - var(--tb, 44px))',
    initialEditType: 'wysiwyg',
    previewStyle: 'tab',
    initialValue: initialMarkdown,
    usageStatistics: false,
    autofocus: false,
  })
  editor.on('change', () => { if (!suppressChange) setDirty(true) })
  // Toast UI fires 'change' during mount and on a layout tick; swallow those.
  setTimeout(() => { suppressChange = false }, 50)
}

function loadIntoEditor (text) {
  suppressChange = true
  editor.setMarkdown(text)
  setTimeout(() => { suppressChange = false }, 0)
}

async function loadFile () {
  if (!FILE_PATH) {
    $('#filename').textContent = 'No file path provided'
    initEditor('')
    return
  }
  $('#filename').textContent = FILE_PATH
  try {
    const res = await fetch(FILE_URL)
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const text = await res.text()
    initEditor(text)
    setDirty(false)
  } catch (err) {
    console.error(err)
    initEditor('')
    flash('Failed to load file: ' + err.message, 5000)
  }
}

async function save () {
  try {
    const fh = await getFileHandleFor(FILE_PATH)
    if (!fh) return
    const writable = await fh.createWritable()
    await writable.write(editor.getMarkdown())
    await writable.close()
    setDirty(false)
    flash('Saved')
    // ping the viewer tab(s) showing this file so they re-render
    chrome.runtime.sendMessage({ message: 'edit.saved', path: FILE_PATH })
  } catch (err) {
    console.error(err)
    if (err.name === 'AbortError') return
    flash('Save failed: ' + err.message, 5000)
  }
}

async function revert () {
  if (dirty && !confirm('Discard unsaved changes and reload from disk?')) return
  try {
    const res = await fetch(FILE_URL + '?t=' + Date.now())
    const text = await res.text()
    loadIntoEditor(text)
    setDirty(false)
    flash('Reloaded')
  } catch (err) {
    flash('Reload failed: ' + err.message, 5000)
  }
}

function bind () {
  $('#btn-save').onclick = save
  $('#btn-revert').onclick = revert

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault(); save()
    }
  })

  window.addEventListener('beforeunload', (e) => {
    if (dirty) { e.preventDefault(); e.returnValue = '' }
  })
}

window.__app = {
  get editor () { return editor },
  get dirty () { return dirty },
  get resolvedFileHandle () { return resolvedFileHandle },
}

setTitle()
bind()
loadFile()
