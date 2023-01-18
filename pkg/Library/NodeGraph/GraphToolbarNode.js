/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const GraphToolbarNode = {
  $meta: {
    id: "GraphToolbarNode",
    displayName: "Graph Toolbar",
    category: "Designer"
  },
  $stores: {
    graphs: {
      $type: '[Pojo]',
      noinspect: true
    },
    graph: {
      $type: 'Pojo'
    },
    selectedNodeId: {
      $type: 'String'
    },
    icons: {
      $type: '[Pojo]',
      noinspect: true
    },
    event: {
      $type: 'String',
      noinspect: true
    }
  },
  graphToolbar: {
    $kind: '$library/NodeGraph/GraphToolbar',
    $staticInputs: {
      publishPaths: {}
    },
    $inputs: [
      'graph',
      'graphs',
      'event'
    ],
    $outputs: [
      'graph',
      'selectedNodeId',
      'graphs',
      'icons',
      //'event'
    ],
    $slots: {
      buttons: {
        GraphButtons: {
          $kind: '$library/NodeGraph/Toolbar',
          $inputs: ['icons'],
          $outputs: ['event']
        }
      },
      chooser: {
        GraphChooser: {
          $kind: '$library/NodeGraph/GraphChooser',
          $inputs: [
            'graph',
            'graphs'
          ],
          $outputs: [
            'graph'
          ]
        }
      }
    }
  }
};