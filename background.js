var collected_headers = {}

function parseUrl(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return parser;
}

chrome.webRequest.onHeadersReceived.addListener(function(details){
  for (var i = 0; i < details.responseHeaders.length; i++) {
    if (details.responseHeaders[i].name.toLowerCase() == "x-miniprofiler-ids") {
      chrome.browserAction.setIcon({ path: 'icon-enabled.png' }, function() {});
      collected_headers[details.url] = JSON.parse(details.responseHeaders[i].value);
    }
  }
},
{urls: ["http://*/*", "https://*/*"]},["responseHeaders"]);

chrome.tabs.onActivated.addListener(function(_tab) {
  chrome.tabs.get(_tab.tabId, function(tab) {
    if (collected_headers[tab.url]) {
      chrome.browserAction.setIcon({ path: 'icon-enabled.png' }, function() {});
    } else {
      chrome.browserAction.setIcon({ path: 'icon-disabled.png' }, function() {});
    }
  })
})

chrome.browserAction.onClicked.addListener(function (tab) { //Fired when User Clicks ICON
  if (collected_headers[tab.url]) {
    var parsed_url = parseUrl(tab.url);
    chrome.tabs.executeScript(tab.id, {code:"window.open('http://" + parsed_url.host + "/mini-profiler-resources/results?id=" + collected_headers[tab.url][0] + "')"});
  }
});
