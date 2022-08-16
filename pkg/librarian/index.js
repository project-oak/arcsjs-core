/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {LibrarianApp} from './LibrarianApp.js';

try {
  const app = new LibrarianApp({
    $arcs: './arcs.js',
    $library: '../Library',
    $app: '.'
  });
  await app.spinup();
} catch(x) {
  console.error(x);
}
