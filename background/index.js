// Import all required scripts
importScripts(
  '/vendor/markdown-it.min.js',
  '/vendor/marked.min.js',
  '/vendor/remark.min.js',
  '/background/md.js',
  '/background/compilers/markdown-it.js',
  '/background/compilers/marked.js',
  '/background/compilers/remark.js',
  '/background/storage.js',
  '/background/webrequest.js',
  '/background/detect.js',
  '/background/inject.js',
  '/background/messages.js',
  '/background/mathjax.js',
  '/background/xhr.js',
  '/background/icon.js'
);

// Then initialize everything
(() => {
  var storage = md.storage(md);
  var inject = md.inject({storage});
  var detect = md.detect({storage, inject});
  var webrequest = md.webrequest({storage});
  var mathjax = md.mathjax();
  var xhr = md.xhr();
  var icon = md.icon({storage});

  var compilers = Object.keys(md.compilers)
    .reduce((all, compiler) => (
      all[compiler] = md.compilers[compiler]({storage}),
      all
    ), {});

  var messages = md.messages({storage, compilers, mathjax, xhr, webrequest, icon});

  chrome.tabs.onUpdated.addListener(detect.tab);
  chrome.runtime.onMessage.addListener(messages);

  icon();
})();
