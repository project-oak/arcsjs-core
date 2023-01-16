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
      $type: '[Pojo]'
    },
    graph: {
      $type: 'Pojo'
    },
    icons: {
      $type: '[Pojo]'
    },
    event: {
      $type: 'String'
    }
  },
  graphToolbar: {
    $kind: '$library/NodeGraph/GraphToolbar',
    $inputs: [
      'graph',
      'graphs',
      'event'
    ],
    $staticInputs: {
      publishPaths: {}
    },
    $outputs: [
      'graph',
      'selectedNodeId',
      'graphs',
      'icons',
      'event'
    ],
    $slots: {
      buttons: {
        GraphButtons: {
          $kind: '$library/NodeGraph/Toolbar',
          $inputs: ['icons'],
          $outputs: ['event'],
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