/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
 import './conf/config.js';
 import {paths} from './conf/allowlist.js';
 import {GraphsApp} from './Library/GraphsApp.js';
 
 try {
   const app = globalThis.app = new GraphsApp(paths);
   await app.spinup();
 } catch(x) {
   console.error(x);
 }
 