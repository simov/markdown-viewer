
// GitHub-style alerts: > [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION]
// compiler-independent: post-processes the compiled html
md.alerts = () => {
  var types = {
    note: 'Note',
    notice: 'Note',
    tip: 'Tip',
    important: 'Important',
    warning: 'Warning',
    caution: 'Caution',
  }

  var marker = /<blockquote>\s*<p>\s*\[!(NOTE|NOTICE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>\s*)?(<\/p>)?/gi

  return {
    // skips code blocks (the marker there is escaped/inside <code>, never directly after <blockquote><p>)
    render: (html) => html.replace(marker, (match, type, closed) => {
      var kind = type.toLowerCase()
      var title = `<p class="markdown-alert-title">${types[kind]}</p>`
      var cls = `markdown-alert markdown-alert-${kind === 'notice' ? 'note' : kind}`
      return `<blockquote class="${cls}">${title}${closed ? '' : '<p>'}`
    })
  }
}
