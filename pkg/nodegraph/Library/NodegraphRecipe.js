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
  'hoveredNodeId',
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
    'selectedNodeId',
    'pipelines',
    'previewLayout',
    'nodegraphLayout'
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
    selectedNodeId: {
      $type: 'String',
    },
    candidates: {
      $type: 'JSON'
    },
    nodeTypes: {
      $type: 'JSON',
      $value: nodeTypes
    },
    hoveredNodeId: {
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
    },
    previewLayout: {
      $type: 'JSON'
    },
    nodegraphLayout: {
      $type: 'JSON'
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
      preview: {
        runner: {
          $kind: '$library/Designer/Designer',
          $inputs: [
            'recipes',
            {pipeline: 'selectedPipeline'},
            'selectedNodeId',
            'nodeTypes',
            'categories',
            {layout: 'previewLayout'}
          ],
          $outputs: [
            {pipeline: 'selectedPipeline'},
            'selectedNodeId',
            {layout: 'previewLayout'}
          ]
        }
      },
      editor: {
        Editor: {
          // $kind: 'https://rapsai-core.web.app/0.5.1/Library/Editor',
          // $kind: 'http://localhost:9876/Library/Editor',
          // $kind: '$library/NodeGraph/SimpleEditor',
          $kind: '$library/NodeGraph/Editor',
          $inputs: [
            {pipeline: 'selectedPipeline'},
            'selectedNodeId',
            'nodeTypes',
            'hoveredNodeId',
            'categories',
            'candidates',
            {layout: 'nodegraphLayout'},
            {previewLayout: 'previewLayout'}
          ],
          $outputs: [
            {pipeline: 'selectedPipeline'},
            'selectedNodeId',
            {layout: 'nodegraphLayout'},
            {previewLayout: 'previewLayout'}
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
      tree: {
        NodeTree: {
          $kind: '$library/NodeGraph/NodeTree',
          $inputs: [
            {pipeline: 'selectedPipeline'},
            'selectedNodeId',
            'nodeTypes',
            'categories',
            {layout: 'previewLayout'}
          ],
          $outputs: [
            {pipeline: 'selectedPipeline'},
            'selectedNodeId',
            {layout: 'previewLayout'}
          ]
        }
      }
    }
  },
  nodeInspector: {
    $kind: '$library/NodeGraph/NodeInspector',
    $inputs: [
      'selectedNodeId',
      {pipeline: 'selectedPipeline'},
      'candidates',
      'nodeTypes'
    ],
    $staticInputs: {
      customInspectors,
      inspectorData: 'inspectorData',
    },
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
  connectionUpdator: {
    $kind: '$library/NodeGraph/ConnectionUpdator',
    $inputs: [
      {pipeline: 'selectedPipeline'},
      'nodeTypes',
      'candidates',
    ],
    $outputs: [{pipeline: 'selectedPipeline'}]
  },
  nodeUpdator: {
    $kind: '$library/NodeGraph/NodeUpdator',
    $inputs: [
      'selectedNodeId',
      {pipeline: 'selectedPipeline'},
      {data: 'inspectorData'}
    ],
    $outputs: [
      'selectedNodeId',
      {pipeline: 'selectedPipeline'}
    ]
  },
  recipeBuilder: {
    $kind: '$library/NodeGraph/RecipeBuilder',
    $inputs: [
      {pipeline: 'selectedPipeline'},
      'nodeTypes',
      {layout: 'previewLayout'}
    ],
    $outputs: ['recipes'],
  },
  layoutUpdator: {
    $kind: '$library/NodeGraph/LayoutUpdator',
    $inputs: [
      {pipeline: 'selectedPipeline'},
      'previewLayout',
      'nodegraphLayout'
    ],
    $outputs: [{pipeline: 'selectedPipeline'}]
  }
};
