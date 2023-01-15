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
  // $stores: {
  //   recipes,
  //   selectedGraph,
  //   selectedNodeId,
  //   nodeTypes,
  //   categories,
  //   previewLayout,
  //   newNodeInfos
  // },
  designer: {
    $kind: '$library/Node/NodeDesigner',
    // $inputs: [
    //   'recipes',
    //   {graph: 'selectedGraph'},
    //   'selectedNodeId',
    //   'nodeTypes',
    //   'categories',
    //   {layout: 'previewLayout'},
    //   'newNodeInfos'
    // ],
    // $outputs: [
    //   {graph: 'selectedGraph'},
    //   'selectedNodeId',
    //   {layout: 'previewLayout'},
    //   'newNodeInfos'
    // ]
  }
};