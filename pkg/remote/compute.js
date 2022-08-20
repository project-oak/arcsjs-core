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
import {ComputeApp} from './Library/ComputeApp.js';

try {
  const app = new ComputeApp(paths);
  await app.spinup();
} catch(x) {
  console.error(x);
}