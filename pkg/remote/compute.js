/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
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