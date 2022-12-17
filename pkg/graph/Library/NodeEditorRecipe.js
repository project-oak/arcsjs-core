/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
const NodeEditor = {
  $stores: {
    editorToolbarEvent: {
      $type: 'String'
    },
    editorToolbarIcons: {
      $type: '[Pojo]'
    },
  },
  Editor: {
    $kind: '$library/NodeGraph/Editor',
    $inputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId',
      'nodeTypes',
      'categories',
      'newNodeInfos',
      {event: 'editorToolbarEvent'}
    ],
    $staticInputs: {
      layoutId: 'nodegraph'
    },
    $outputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId',
      'newNodeInfos',
      {event: 'editorToolbarEvent'},
      'editorToolbarIcons'
    ],
    $slots: {
      toolbar: {
        editorToolbar: {
          $kind: '$library/NodeGraph/Toolbar',
          $inputs: [{icons: 'editorToolbarIcons'}],
          $outputs: [{event: 'editorToolbarEvent'}]
        }
      }
    }
  }
};