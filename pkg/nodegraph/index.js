/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import './conf/support.js';
import {NodegraphApp} from './Library/NodegraphApp.js';

// spin up application instance
await (globalThis.App = new NodegraphApp()).spinup();
