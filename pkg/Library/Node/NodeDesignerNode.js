/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const NodeDesignerNode = {
  $meta: {
    id: 'NodeDesignerNode',
    displayName: 'Node Designer',
    category: 'Designer'
  },
  $stores: {
    graph: {
      $type: 'Pojo'
    },
    selectedNodeId: {
      $type: 'String'
    },
    nodeTypes: {
      $type: 'Pojo',
      $value: {}
    },
    categories: {
      $type: 'Pojo'
    },
    newNodeInfos: {
      $type: 'Pojo'
    }
  //   recipes,
  //   previewLayout,
  },
  designer: {
    $kind: '$library/Node/NodeDesigner',
    $staticInputs: {
      layoutId: 'preview'
    },
    $inputs: [
    //   'recipes',
      'graph',
      'selectedNodeId',
      'nodeTypes',
      'categories',
    //   'newNodeInfos'
    ],
    $outputs: [
    //   {graph: 'selectedGraph'},
      'selectedNodeId',
      'newNodeInfos'
    ]
  }
};