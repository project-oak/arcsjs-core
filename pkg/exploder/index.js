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
import {StudioApp} from './StudioApp.js';

try {
  const app = new StudioApp(paths);
  await app.spinup();
} catch(x) {
  console.error(x);
}