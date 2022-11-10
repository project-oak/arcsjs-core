/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const ObjectInspectorNode = {
  $meta: {
    id: 'ObjectInspectorNode',
    category: 'Panels'
  },
  $stores: {
    inspectorData: {
      $type: 'JSON',
      noinspect: true
    }
  },
  inspector: {
    $kind: '$library/NodeGraph/Inspector',
    $inputs: [{data: 'inspectorData'}]
  },
  nodeInspector: {
    $kind: '$library/NodeGraph/NodeInspector',
    $staticInputs: {
      inspectorData: 'inspectorData',
    },
    $inputs: [
      //{graph: 'selectedGraph'},
      //'selectedNodeId',
      //'candidates',
      //'nodeTypes'
    ],
    $outputs: [{data: 'inspectorData'}]
  },
};