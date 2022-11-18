
md.icon = ({storage: {state}}) => () => {

  setTimeout(() => {
    if (state.icon) {
      chrome.action.setIcon({
        path: {
          '16' : '/icons/icon16-light.png',
          '19' : '/icons/icon19-light.png',
          '38' : '/icons/icon38-light.png',
          '48' : '/icons/icon48-light.png',
          '128' : '/icons/icon128-light.png'
        }
      })
    }
    else {
      chrome.action.setIcon({
        path: {
          '16' : '/icons/icon16.png',
          '19' : '/icons/icon19.png',
          '38' : '/icons/icon38.png',
          '48' : '/icons/icon48.png',
          '128' : '/icons/icon128.png'
        }
      })
    }
  }, 100)
}
