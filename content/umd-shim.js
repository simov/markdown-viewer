;(function () {
  var root = typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
      ? self
      : window

  // Some extension script runtimes expose Node-like `module` / `exports`. UMD
  // bundles then take the CommonJS branch and skip browser globals (vega,
  // vegaEmbed, @hpcc-js/wasm), which breaks our content-script renderers.
  if (typeof root.module !== 'undefined') {
    try {
      delete root.module
    }
    catch (err) {
      root.module = undefined
    }
  }
  if (typeof root.exports !== 'undefined') {
    try {
      delete root.exports
    }
    catch (err) {
      root.exports = undefined
    }
  }
})()
