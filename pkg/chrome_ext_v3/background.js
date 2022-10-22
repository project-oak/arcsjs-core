/* global chrome */

chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL("hello.html");
  /*const tab = */await chrome.tabs.create({url});
});

onmessage = event => {
  console.log(event);
};

chrome.runtime.onMessage.addListener(event => {
  console.log(event);
});