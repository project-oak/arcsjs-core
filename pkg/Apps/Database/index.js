/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import './conf/config.js';
import {quickStart} from './conf/arcs.js';
import {DbApp} from './Library/DbApp.js';

quickStart(DbApp, import.meta.url, {
  $config: `$app/conf/config.js`,
  $db: `$app/Library`
});
