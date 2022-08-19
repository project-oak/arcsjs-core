/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import './conf/config.js';
import {paths} from './conf/allowlist.js';
import {RemoteApp} from './Library/RemoteApp.js';

try {
  const app = new RemoteApp(paths);
  await app.spinup();
} catch(x) {
  console.error(x);
}