/* global chrome */

// no eval allowed in background.js
// so, particle-scripts cannot be eval'd here

chrome.runtime.onConnect.addListener((port) => {
  console.log('got connected');
  port.onMessage.addListener(msg => console.log('Background got', msg));
});


// import './deploy/Library/Core/core.js';
// import './deploy/Library/Isolation/vanilla.js';
// //import {Arcs} from './deploy/Library/App/TopLevel/Arcs.js';
// import {App} from './deploy/Library/App/TopLevel/App.js';

// const paths = {
//   $library: './deploy/Library'
// };

// (async () => {
//   await import('./Test.js');
//   const app = new App(paths);
//   //await app.spinup();
//   // await Arcs.init({
//   //   //paths: this.paths,
//   //   //root: this.root || document.body,
//   //   //onservice: this.service.bind(this),
//   //   //injections: {themeRules, ...this.injections}
//   // });
// })();

// chrome.action.onClicked.addListener(async () => {
//   const url = chrome.runtime.getURL("hello.html");
//   /*const tab = */await chrome.tabs.create({url});
// });
