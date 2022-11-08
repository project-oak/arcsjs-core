/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import './config.js';
import {quickStart} from './arcs.js';
import {GraphsApp} from './GraphsApp.js';

quickStart(GraphsApp, import.meta.url, {
  $library: `http://localhost:8888/0.4.4/Library`, //$app/../Library`,
  $config: `$app/conf-node/config.js`
});
