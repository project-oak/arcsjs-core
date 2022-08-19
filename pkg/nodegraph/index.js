/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import './conf/support.js';
import {NodegraphApp} from './Library/NodegraphApp.js';

// spin up application instance
await (globalThis.App = new NodegraphApp()).spinup();
