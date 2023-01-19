/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import 'https://arcsjs.web.app/0.4.5/Apps/Graph/config.js';
import {quickStart} from 'https://arcsjs.web.app/0.4.5/Apps/Graph/arcs.js';
import {NodegraphApp} from 'https://arcsjs.web.app/0.4.5/Apps/Graph/Library/NodegraphApp.js';
import 'https://arcsjs.web.app/0.4.5/Library/Mediapipe/PoseServiceLoader.js';

globalThis.ArcsAnywhere = {
  quickStart,
  NodegraphApp
};
