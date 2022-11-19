
md.icon = ({storage: {state}}) => () => {

  setTimeout((color) =>
    chrome.action.setIcon({
      path: [16, 19, 38, 48, 128].reduce((all, size) => (
        color = state.icon ? 'light' : 'dark',
        all[size] = `/icons/${color}/${size}x${size}.png`,
        all
      ), {})
    })
  , 100)
}
