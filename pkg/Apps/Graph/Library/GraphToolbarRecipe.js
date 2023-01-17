/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const GraphToolbarRecipe = {
  $stores: {
    graphToolbarEvent: {
      $type: 'String'
    },
    graphToolbarIcons: {
      $type: '[Pojo]'
    }
  },
  graphToolbar: {
    $kind: '$library/NodeGraph/GraphToolbar',
    $inputs: [
      {graph: 'selectedGraph'},
      'graphs',
      {event: 'graphToolbarEvent'}
    ],
    $staticInputs: {
      publishPaths: {}
    },
    $outputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId',
      'graphs',
      {icons: 'graphToolbarIcons'},
      {event: 'graphToolbarEvent'}
    ],
    $slots: {
      buttons: {
        GraphButtons: {
          $kind: '$library/NodeGraph/Toolbar',
          $inputs: [{icons: 'graphToolbarIcons'}],
          $outputs: [{event: 'graphToolbarEvent'}],
        }
      },
      chooser: {
        GraphChooser: {
          $kind: '$library/NodeGraph/GraphChooser',
          $inputs: [
            {graph: 'selectedGraph'},
            'graphs'
          ],
          $outputs: [{graph: 'selectedGraph'}]
        }
      }
    }
  }
};