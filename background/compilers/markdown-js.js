
md.compilers['markdown-js'] = (() => {
  var defaults = {}
  var description = {}

  var ctor = ({storage: {state}}) => ({
    defaults,
    description,
    compile: (_markdown) =>
      markdown.toHTML(_markdown)
  })

  return Object.assign(ctor, {defaults, description})
})()
