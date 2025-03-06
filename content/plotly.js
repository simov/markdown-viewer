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
      console.log('Definitions found:', definitions)
      
      Array.from(document.querySelectorAll('pre code.plotly')).forEach((plot, index) => {
        try {
          let rawData = definitions[index]
          console.log('Before decode:', rawData)
          
          // Decode HTML entities
          rawData = decodeHtml(rawData.trim())
          console.log('After decode:', rawData)
          console.log('First character code:', rawData.charCodeAt(0))
          
          // Remove any BOM or invisible characters
          rawData = rawData.replace(/^\uFEFF/, '')
          rawData = rawData.replace(/^\s+|\s+$/g, '')
          console.log('After cleanup:', rawData)
          
          const plotData = JSON.parse(rawData)
          const plotDiv = document.createElement('div')
          plotDiv.className = 'plotly-container'
          plot.parentElement.replaceWith(plotDiv)
          Plotly.newPlot(plotDiv, plotData.data, plotData.layout || {})
        }
        catch (err) {
          console.error('Failed to render Plotly plot:', err)
          console.error('Raw data that caused error:', definitions[index])
        }
      })
      
      loaded = true
    }
  }
})()