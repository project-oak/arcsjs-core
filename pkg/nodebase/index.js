/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import './config.js';
import {NodebaseApp} from './NodebaseApp.js';

// spin up application instance
try {
  const app = globalThis.app = new NodebaseApp({
    $arcs: './arcs.js',
    $library: '../Library',
    $app: '.'
  });
  await app.spinup();
} catch(x) {
  console.error(x);
}