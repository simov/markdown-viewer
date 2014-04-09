// chrome.storage.sync.clear();
chrome.storage.sync.get(function (sync) {
    if (!sync.options)
        chrome.storage.sync.set({options: md.defaults});
    if (!sync.theme)
        chrome.storage.sync.set({theme: 'github'});
    if (sync.raw === undefined)
        chrome.storage.sync.set({raw: false});
});

chrome.tabs.onUpdated.addListener(function (id, info, tab) {
    if (info.status === 'complete') return;
    if (/.*\/.*\.(markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)$/.test(tab.url)) {
        chrome.pageAction.show(id);
    }
});

chrome.extension.onMessage.addListener(function (req, sender, sendResponse) {
    switch (req.message) {
        case 'markdown':
            md.compile(req.markdown, sendResponse);
            break;
        
        case 'settings':
            chrome.storage.sync.get(['options', 'theme', 'raw'], function (data) {
                delete data.options.langPrefix;
                console.log(data);
                sendResponse(data);
            });
            break;

        case 'options':
            req.options.langPrefix = 'language-';//prism
            chrome.storage.sync.set({options: req.options}, sendResponse);
            sendMessage({message: 'reload'});
            break;
        case 'defaults':
            chrome.storage.sync.set({options: md.defaults}, sendResponse);
            chrome.storage.sync.set({theme: 'github'});
            chrome.storage.sync.set({raw: false});
            sendMessage({message: 'reload'});
            break;

        case 'theme':
            chrome.storage.sync.set({theme: req.theme}, sendResponse);
            sendMessage({message: 'theme', theme: req.theme});
            break;

        case 'raw':
            chrome.storage.sync.set({raw: req.raw}, sendResponse);
            sendMessage({message: 'raw'});
            break;
    }
    return true;
});

function sendMessage (obj) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, obj);
    });
}
