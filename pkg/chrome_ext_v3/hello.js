/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import './app/config.js';
import {quickStart/*, Paths*/} from './app/arcs.js';
import {ExtensionApp} from './app/ExtensionApp.js';

await quickStart(ExtensionApp, import.meta.url, {
  $nodegraph: '$app/deploy/nodegraph/Library',
  //$library: '$app/../deploy/Library',
  //$pathMacro: '$otherMacro/path'
});

//quickStart(ExtensionApp);

// try {
//   const app = new ExtensionApp(Paths.map);
//   await app.spinup();
// } catch(x) {
//   console.error(x);
// }
