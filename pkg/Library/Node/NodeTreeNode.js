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
    category: 'Panels'
  },
  NodeTree: {
    $kind: '$library/Node/NodeTree',
    $inputs: [
      // {graph: 'selectedGraph'},
      // 'selectedNodeId',
      // 'nodeTypes',
      // 'categories'
    ],
    $staticInputs: {
      layoutId: 'preview'
    },
    $outputs: [
      // {graph: 'selectedGraph'},
      // 'selectedNodeId'
    ]
  }
};