
// // configurable dependencies
// import './conf/support.js';

// // factored out for ease of testing
// import {HelloWorldApp} from './HelloWorldApp.js';

// // spin up application
// await (globalThis.App = new HelloWorldApp()).spinup();

/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

 import {HelloWorldApp} from './HelloWorldApp.js';

 try {
   const app = new HelloWorldApp({
     $arcs: './arcs.js',
     $library: '../Library',
     $app: '.'
   });
   await app.spinup();
 } catch(x) {
   console.error(x);
 }
 