/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {nodeTypes, categories} from './nodeTypes.js';
import {customInspectors} from './customInspectors.js';
import {NodeCatalogRecipe} from '../../Library/NodeCatalog/NodeCatalogRecipe.js';

const globalStores = [
  'selectedNode',
  'selectedPipeline',
  'nodeTypes',
  'hoveredNodeKey',
  'categories',
  'nodeKey',
];

const PipelineToolbar = {
  $kind: '$library/NodeGraph/PipelineToolbar',
  $inputs: [
    {pipeline: 'selectedPipeline'},
    'pipelines'
  ],
  $staticInputs: {
    publishPaths: {}
  },
  $outputs: [
    {pipeline: 'selectedPipeline'},
    'selectedNodeKey',
    'pipelines'
  ],
  $slots: {
    chooser: {
      PipelineChooser: {
        $kind: '$library/NodeGraph/PipelineChooser',
        $inputs: [
          {pipeline: 'selectedPipeline'},
          'pipelines'
        ],
        $outputs: [{pipeline: 'selectedPipeline'}]
      }
    }
  }
};

export const NodegraphRecipe = {
  $meta: {
    description: 'Node Editor Recipe'
  },
  $stores: {
    pipelines: {
      $type: '[JSON]',
      $tags: ['persisted'],
      $value: []
    },
    selectedPipeline: {
      $type: 'JSON',
      $value: null
    },
    selectedNodeKey: {
      $type: 'String', //'JSON'
    },
    candidates: {
      $type: 'JSON'
    },
    nodeTypes: {
      $type: 'JSON', // '[JSON]',
      $value: nodeTypes
    },
    hoveredNodeKey: {
      $type: 'String'
    },
    inspectorData: {
      $type: 'JSON'
    },
    recipes: {
      $type: '[JSON]',
      $value: []
    },
    categories: {
      $type: 'JSON',
      $value: categories
    }
  },
  // 'a_frame': {
  //   $kind: '$library/AFrame/Scene.js'
  // },
  main: {
    $kind: '$app/Library/Nodegraph',
    $slots: {
      catalog: NodeCatalogRecipe,
      toolbar: {
        PipelineToolbar
      },
      // preview: {
      //   runner: {
      //     $kind: '$library/Designer/Designer',
      //     $inputs: [
      //       'recipes',
      //       {pipeline: 'selectedPipeline'},
      //       'selectedNode',
      //       'nodeTypes',
      //       'categories',
      //     ],
      //     $outputs: [
      //       {pipeline: 'selectedPipeline'},
      //       'selectedNode'
      //     ]
      //   }
      // },
      editor: {
        Editor: {
          // $kind: 'https://rapsai-core.web.app/0.5.1/Library/Editor',
          // $kind: 'http://localhost:9876/Library/Editor',
          // $kind: '$library/NodeGraph/SimpleEditor',
          $kind: '$library/NodeGraph/Editor',
          $inputs: [
            {pipeline: 'selectedPipeline'},
            'selectedNodeKey',
            'nodeTypes',
            'hoveredNodeKey',
            'categories',
            'candidates'
          ],
          $outputs: [
            {pipeline: 'selectedPipeline'},
            'selectedNodeKey'
          ]
        }
      },
      inspector: {
        Inspector: {
          $kind: '$library/NodeGraph/Inspector',
          $inputs: [{data: 'inspectorData'}],
          $outputs: [{data: 'inspectorData'}],
          $staticInputs: {customInspectors}
        }
      },
      // tree: {
      // NodeTree: {
      // $kind: '$library/NodeGraph/NodeTree',
      // $inputs: [
      // {pipeline: 'selectedPipeline'},
      // 'selectedNode',
      // 'nodeTypes',
      // 'categories'
      // ],
      // $outputs: [
      // {pipeline: 'selectedPipeline'},
      // 'selectedNode'
      // ]
      // }
      // }
      // }
    }
  },
  nodeInspector: {
    $kind: '$library/NodeGraph/NodeInspector',
    $inputs: [
      'selectedNodeKey',
      {pipeline: 'selectedPipeline'},
      'candidates',
      'nodeTypes'
    ],
    $outputs: [{data: 'inspectorData'}]
  },
  candidateFinder: {
    $kind: '$library/NodeGraph/CandidateFinder',
    $inputs: [
      {pipeline: 'selectedPipeline'},
      'nodeTypes'
    ],
    $staticInputs: {globalStores},
    $outputs: ['candidates']
  },
  nodeUpdator: {
    $kind: '$library/NodeGraph/NodeUpdator',
    $inputs: [
      'selectedNodeKey',
      {pipeline: 'selectedPipeline'},
      {data: 'inspectorData'}
    ],
    $outputs: [
      'selectedNodeKey',
      {pipeline: 'selectedPipeline'}
    ]
  },
  // nodesConnector: {
  // $kind: '$library/NodeGraph/NodesConnector',
  // $inputs: [
  // {pipeline: 'selectedPipeline'},
  // 'selectedNode',
  // 'nodeTypes'
  // ],
  // $outputs: [
  // {pipeline: 'selectedPipeline'},
  // 'selectedNode',
  // 'recipes'
  // ],
  // $staticInputs: {
  // customInspectors,
  // inspectorData: 'inspectorData',
  // globalStores
  // }
  // }
};
