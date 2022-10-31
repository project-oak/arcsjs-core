/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// load code into the client's context (try to keep it neat!)
const loadInPage = src => document.firstElementChild.appendChild(Object.assign(document.createElement('script'), {src}));
loadInPage(chrome.runtime.getURL('plugin/virtual-camera.js'));
loadInPage(chrome.runtime.getURL('plugin/virtual-stream.js'));

// connect to the extension
const port = chrome.runtime.connect();
//const port = chrome.runtime.connect({name: 'client'});

// forward messages from the extension to the client window
const forwardToClient = msg => {
  console.log("(forwarding to client)", msg.type);
  window.postMessage({...msg, incoming: true}, '*');
};
port.onMessage.addListener(forwardToClient);

// forward messages from the client window to the extension
const forwardToExtension = ({data: msg}) => {
  if (msg.outgoing) {
    console.log("(forwarding to extension)", msg.type);
    port.postMessage(msg);
  }
};
window.addEventListener('message', forwardToExtension);