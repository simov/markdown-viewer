;(async () => {
  const localData = await chrome.storage.local.get('temporaryMarkdown')
  const markdown = localData.temporaryMarkdown || ''

  const pre = document.querySelector('pre')
  pre.textContent = markdown

  const state = await chrome.storage.sync.get()
  
  window.args = {
    theme: state.theme,
    raw: state.raw,
    themes: state.themes,
    content: state.content,
    compiler: state.compiler,
    custom: state.custom,
    icon: state.settings.icon,
  }

  const loadCSS = (href) => {
    return new Promise((resolve) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = href
      link.onload = resolve
      document.head.appendChild(link)
    })
  }

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = resolve
      script.onerror = reject
      document.body.appendChild(script)
    })
  }

  await Promise.all([
    loadCSS('/content/index.css'),
    loadCSS('/content/themes.css')
  ])

  await loadScript('/vendor/mithril.min.js')
  await loadScript('/vendor/mammoth.browser.min.js')
  await loadScript('/vendor/jszip.min.js')
  await loadScript('/vendor/docx-preview.min.js')

  if (window.args.content.syntax) {
    await loadScript('/vendor/prism.min.js')
    await loadScript('/vendor/prism-autoloader.min.js')
    await loadScript('/content/prism.js')
  }

  if (window.args.content.emoji) {
    await loadScript('/content/emoji.js')
  }

  if (window.args.content.mermaid) {
    await loadScript('/vendor/mermaid.min.js')
    await loadScript('/vendor/panzoom.min.js')
    await loadScript('/content/mermaid.js')
  }

  if (window.args.content.mathjax) {
    await loadScript('/content/mathjax.js')
    await loadScript('/vendor/mathjax/tex-mml-chtml.js')
  }

  await loadScript('/content/index.js')
  await loadScript('/content/scroll.js')

  if (window.args.content.autoreload) {
    await loadScript('/content/autoreload.js')
  }
})()
