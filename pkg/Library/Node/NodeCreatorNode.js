/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const NodeCreatorNode = {
  $meta: {
    id: 'NodeCreatorNode',
    displayName: 'Node Creator',
    category: 'Designer'
  },
  $stores: {
    graph: {
      $type: 'Pojo'
    },
    nodeTypes: {
      $type: 'Pojo'
    },
    newNodeInfos: {
      $type: 'Pojo'
    }
  },
  // combiner: {
  //   $kind: '$library/Node/NodeTypesCombiner',
  //   $inputs: ['builtinNodeTypes', 'selectedGraph'],
  //   $outputs: [{results: 'nodeTypes'}, 'selectedGraph']
  // },
  creator: {
    $kind: '$library/Node/NodeCreator',
    $inputs: [
      'newNodeInfos',
      'nodeTypes',
      'graph'
    ],
    $outputs: [
      'newNodeInfos',
      'graph',
      'selectedNodeId'
    ]
  }
};