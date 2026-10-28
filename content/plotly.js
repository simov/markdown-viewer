var plt = (() => {
  var loaded = false

  var walk = (regex, string, result = [], match = regex.exec(string)) =>
    !match ? result : walk(regex, string, result.concat(match[1]))

  function decodeHtml(html) {
    var txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  return {
    render: () => {
      var definitions = walk(/<pre><code class="plotly">([\s\S]+?)<\/code><\/pre>/gi, state.html)

      Array.from(document.querySelectorAll('pre code.plotly')).forEach((plot, index) => {
        try {
          var rawData = decodeHtml((definitions[index] || plot.textContent).trim())
          rawData = rawData.replace(/^\uFEFF/, '').trim()
          var plotData = JSON.parse(rawData)
          var plotDiv = document.createElement('div')
          plotDiv.className = 'plotly-container md-copy-host'
          plotDiv.dataset.mdCopySource = rawData
          plot.parentElement.replaceWith(plotDiv)
          Plotly.newPlot(plotDiv, plotData.data, plotData.layout || {})
        }
        catch (err) {
          console.error('Failed to render Plotly plot:', err)
        }
      })

      loaded = true
    }
  }
})()
