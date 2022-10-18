/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

// import {NodeCatalogRecipe} from '../arcs.js';
// import {nodeTypes, categories} from './nodeTypes.js';

const globalStores = [
  // 'selectedNodeId',
  // 'selectedPipeline',
  // 'nodeTypes',
  // 'hoveredNodeId',
  // 'categories',
  // 'nodeKey',
];

// const PipelineToolbar = {
//   $kind: '$library/NodeGraph/PipelineToolbar',
//   $inputs: [
//     {pipeline: 'selectedPipeline'},
//     'pipelines'
//   ],
//   $staticInputs: {
//     publishPaths: {}
//   },
//   $outputs: [
//     {pipeline: 'selectedPipeline'},
//     'pipelines',
//     'pipelines',
//     'previewLayout',
//     'nodegraphLayout'
//   ],
//   $slots: {
//     chooser: {
//       PipelineChooser: {
//         $kind: '$library/NodeGraph/PipelineChooser',
//         $inputs: [
//           {pipeline: 'selectedPipeline'},
//           'pipelines'
//         ],
//         $outputs: [{pipeline: 'selectedPipeline'}]
//       }
//     }
//   }
// };

export const SimpleRecipe = {
  $meta: {
    description: 'Simple Recipe'
  },
  $stores: {
    // pipelines: {
    //   $type: '[JSON]',
    //   $tags: ['persisted'],
    //   $value: []
    // },
    // selectedPipeline: {
    //   $type: 'JSON',
    //   $value: null
    // },
    // selectedNodeId: {
    //   $type: 'String'
    // },
    // candidates: {
    //   $type: 'JSON'
    // },
    // nodeTypes: {
    //   $type: '[JSON]',
    //   $value: nodeTypes
    // },
    // hoveredNodeId: {
    //   $type: 'String'
    // },
    // inspectorData: {
    //   $type: 'JSON'
    // },
    // recipes: {
    //   $type: '[JSON]',
    //   $value: []
    // },
    // categories: {
    //   $type: 'JSON',
    //   $value: categories
    // },
    // previewLayout: {
    //   $type: 'JSON'
    // },
    // nodegraphLayout: {
    //   $type: 'JSON'
    // },
    showFlyout: {
      $type: 'Boolean'
    }
  },
  flyout: {
    $kind: '$library/Layout/FlyOut',
    $inputs: [{show: 'showFlyout'}],
    $outputs: [{show: 'showFlyout'}],
    $slots: {
      flyout: {}
    }
  },
  main: {
    $kind: '$app/Library/Simple',
    $outputs: ['showFlyout'],
    $slots: {}
  }
  /*,
  otherParticle: {
    $kind: '$library/Category/Kind',
    $inputs: [],
    $outputs: []
  }
  */
};
