/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const NodeInspectorNode = {
  $meta: {
    id: 'NodeInspectorNode',
    displayName: 'Node Inspector',
    category: 'Designer'
  },
  $stores: {
    graph: {
      $type: 'Pojo'
    },
    selectedNodeId: {
      $type: 'String'
    },
    candidates: {
      $type: 'Pojo'
    },
    nodeTypes: {
      $type: 'Pojo'
    },
    data: {
      $type: 'Pojo'
    }
  },
  objectInspector: {
    $kind: '$library/Node/ObjectInspector',
    $inputs: [
      'data'
    ]
  },
  nodeInspector: {
    $kind: '$library/Node/NodeInspector',
    $staticInputs: {
      inspectorData: 'inspectorData'
    },
    $inputs: [
      'graph',
      'selectedNodeId',
      'candidates',
      'nodeTypes'
    ],
    $outputs: [
      'data'
    ]
  },
};