/* global chrome */

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: 'deploy/librarian/index.html'
  });
});
