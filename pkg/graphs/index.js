/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import './conf/config.js';
import {quickStart} from './conf/arcs.js';
import {GraphsApp} from './Library/GraphsApp.js';

await quickStart(GraphsApp, import.meta.url, {
  $library: `$app/../Library`,
  $config: `$app/conf/config.js`,
  $graphs: `$app/Library`
});
