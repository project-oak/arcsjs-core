/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import 'https://arcsjs.web.app/lib/corsFix.js';

export * from '../../Library/TensorFlow/TensorFlow.js';
export * from '../../Library/Core/utils.min.js';

export * from '../../Library/App/common-dom.js';
export * from '../../Library/Designer/designer-layout.js';
export * from '../../Library/Dom/multi-select.js';
export * from '../../Library/NodeGraph/dom/node-graph.js';
export * from '../../Library/Threejs/threejs-editor.js';
export * from '../../Library/PixiJs/pixi-view.js';

// n.b. operates in outer context

// extract an absolute url to the folder 2 above here (counting the filename, aka 'nodegraph/')
import {Paths} from '../../Library/Core/utils.min.js';
const url = Paths.getAbsoluteHereUrl(import.meta, 2);

// calculate important paths
export const paths = {
  $app: url,
  $nodegraph: `${url}/Library`,
  $config: `${url}/conf/config.js`,
  $library: `${url}/../Library`
};
