// const port = chrome.runtime.connect();
// port.postMessage('hello from content');

// port.onMessage.addListener((msg) => {
//   window.postMessage({ ...msg, incoming: true }, '*');
// });

// window.addEventListener('message', (message) => {
//   if (message.data.outgoing) {
//     port.postMessage(message.data);
//   }
// });

const loadInPage = src => document.firstElementChild.appendChild(Object.assign(document.createElement('script'), {src}));
loadInPage(chrome.runtime.getURL('virtual-camera.js'));

// thunk to load other stuff ... why?
// const client = chrome.runtime.getURL('client.js');
(async () => {
  // const port = chrome.runtime.connect({name: 'client'});
  // window.addEventListener('message', (message) => {
  //   console.log(message);
  //   //if (message.data.outgoing) {
  //     //port.postMessage(message.data);
  //   //}
  // });
})();

// (function () {
//   // Install webcam emulation.
//   const SCRIPT = Object.assign(document.createElement('script'),
//     {'src': chrome.runtime.getURL('client.js')});
//   const root = document.documentElement;
//   root.insertBefore(SCRIPT, root.lastChild);
//   //
//   // const IMAGE_SCRIPT = document.createElement('script');
//   // IMAGE_SCRIPT.setAttribute('src', chrome.extension.getURL('interactive_image.js'));
//   // root.insertBefore(IMAGE_SCRIPT, root.lastChild);
//   //
//   // critical linkage with background
//   //
//   const port = chrome.runtime.connect({name: 'client'});
//   window.addEventListener('message', (message) => {
//     if (message.data.outgoing) {
//       port.postMessage(message.data);
//     }
//   });
//   port.onMessage.addListener((msg) => {
//     window.postMessage({ ...msg, incoming: true }, '*');
//   });
// })();
