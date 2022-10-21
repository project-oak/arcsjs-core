/* global chrome */

// chrome.runtime.onInstalled.addListener(async () => {
//   // While we could have used `let url = "hello.html"`, using runtime.getURL is a bit more robust as
//   // it returns a full URL rather than just a path that Chrome needs to be resolved contextually at
//   // runtime.
//   const url = chrome.runtime.getURL("hello.html");
//   // Open a new tab pointing at our page's URL using JavaScript's object initializer shorthand.
//   // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#new_notations_in_ecmascript_2015
//   //
//   // Many of the extension platform's APIs are asynchronous and can either take a callback argument
//   // or return a promise. Since we're inside an async function, we can await the resolution of the
//   // promise returned by the tabs.create call. See the following link for more info on async/await.
//   // https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
//   const tab = await chrome.tabs.create({ url });
//   // chrome.scripting.executeScript({
//   //   target: { tabId: tab.id },
//   //   files: ['content-script.js']
//   // });
//   // Finally, let's log the ID of the newly created tab using a template literal.
//   // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
//   //
//   // To view this log message, open chrome://extensions, find "Hello, World!", and click the
//   // "service worker" link in the card to open DevTools.
//   console.log(`Created tab ${tab.id}`);
// });

chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL("hello.html");
  //const tab = await chrome.tabs.create({ url });
  //chrome.tabs.sendMessage(tab.id, 'hello', {});
});

// no Worker
//var worker = new Worker("./worker.js");

// no Eval
// import './deploy/Library/Core/core.js';
// import './deploy/librarian/arcs.js';
// import {ExtensionApp} from './ExtensionApp.js';

// export const paths = {
//   $library: './deploy/Library',
//   $config: './config.js',
//   $app: '.'
// };

// const startup = async () => {
//   try {
//     const app = new ExtensionApp(paths);
//     await app.spinup();
//   } catch(x) {
//     console.error(x);
//   }
// };

// startup();

// chrome.action.onClicked.addListener((tab) => {
//   //startup();
//   chrome.tabs.create({
//     url: 'deploy/librarian/index.html'
//   });
// });
