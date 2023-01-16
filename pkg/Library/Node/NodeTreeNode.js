/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const NodeTreeNode = {
  $meta: {
    id: 'NodeTreeNode',
    displayName: 'Node Tree',
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
    }
  },
  NodeTree: {
    $kind: '$library/Node/NodeTree',
    $inputs: [
      'graph',
      'selectedNodeId',
      'nodeTypes',
      'categories'
    ],
    $staticInputs: {
      layoutId: 'preview'
    },
    $outputs: [
      'graph',
      'selectedNodeId'
    ]
  }
};