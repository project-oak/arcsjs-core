/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import '../../Library/App/Common/config.js';
import {boot} from '../../Library/App/Common/boot.js';

const graphs = JSON.parse(localStorage.getItem('user/graph/0.4.5/graphs'));
const graph = graphs.find(g => g.$meta?.name === 'idolized-voice');

if (graph) {
  boot(import.meta.url, {graph, defaultContainer: 'NodeDesignerNode1_designer#graph'});
}
