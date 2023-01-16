/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const NodeEditorNode = {
  $meta: {
    id: 'NodeEditorNode',
    displayName: 'Node Editor',
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
    },
    event: {
      $type: 'String'
    },
    editorToolbarIcons: {
      $type: '[Pojo]'
    }
  },
  Editor: {
    $kind: '$library/Node/NodeEditor',
    $inputs: [
      'graph',
      'selectedNodeId',
      'nodeTypes',
      'categories',
      'newNodeInfos',
      'event'
    ],
    $staticInputs: {
      layoutId: 'nodegraph'
    },
    $outputs: [
      'graph',
      'selectedNodeId',
      'newNodeInfos',
      'event',
      'editorToolbarIcons'
    ],
    $slots: {
      toolbar: {
        editorToolbar: {
          $kind: '$library/NodeGraph/Toolbar',
          $inputs: [{icons: 'editorToolbarIcons'}],
          $outputs: ['event']
        }
      }
    }
  }
};
