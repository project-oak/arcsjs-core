/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {nodeTypes} from './nodeTypes.js';
import {PipelinesToolbar} from './PipelinesToolbar.js';
import {NodeCatalogParticles, NodeCatalogStores} from '../../Library/NodeCatalog/NodeCatalogSpecs.js';

export const NodebaseRecipe = {
  $meta: {
    description: 'Nodebase Editor Recipe'
  },
  $stores: {
    records: {
      $type: '[Pojo]',
      $tags: ['persisted'],
      $value: []
    },
    selectedPipeline: {
      $type: 'Pojo',
      $tags: ['persisted'],
      $value: null
    },
    selectedNode: {
      $type: 'Pojo'
    },
    nodeTypes: {
      $type: '[Pojo]',
      $value: nodeTypes
    },
    inspectorData: {
      $type: 'Pojo'
    },
    recipes: {
      $type: '[Pojo]',
      $value: []
    },
    ...NodeCatalogStores
  },
  main: {
    $kind: './Library/Nodebase',
    $inputs: [
      {pipeline: 'selectedPipeline'}
    ],
    $outputs: [
      {pipeline: 'selectedPipeline'}
    ],
    $slots: {
      catalog: {
        ...NodeCatalogParticles,
      },
      toolbar: {
        PipelinesToolbar
      },
      preview: {
        navigator: {
          $kind: './Library/Navigator',
          $inputs: '*',
          $outputs: ['records']
        },
        runner: {
          $kind: '$library/NodeGraph/Runner',
          $inputs: [
            'recipes',
            {pipeline: 'selectedPipeline'},
            'selectedNode'
          ],
          $outputs: [
            {pipeline: 'selectedPipeline'},
            'selectedNode'
          ]
        }
      },
      editor: {
        Editor: {
          $kind: '$library/NodeGraph/Editor',
          $inputs: [
            {pipeline: 'selectedPipeline'},
            'selectedNode',
            'nodeTypes',
          ],
          $outputs: [
            {pipeline: 'selectedPipeline'},
            'selectedNode',
          ]
        }
      },
      inspector: {
        Inspector: {
          $kind: '$library/NodeGraph/Inspector',
          $inputs: [{data: 'inspectorData'}],
          $outputs: [{data: 'inspectorData'}]
        }
      }
    }
  },
  nodeInspector: {
    $kind: '$library/NodeGraph/NodeInspector',
    $inputs: [
      {node: 'selectedNode'},
      {pipeline: 'selectedPipeline'},
      'nodeTypes',
    ],
    $outputs: [
      {node: 'selectedNode'},
    ],
  },
  nodeUpdator: {
    $kind: '$library/NodeGraph/NodeUpdator',
    $inputs: [
      {node: 'selectedNode'},
      {pipeline: 'selectedPipeline'},
      {data: 'inspectorData'}
    ],
    $outputs: [
      {node: 'selectedNode'},
      {pipeline: 'selectedPipeline'},
    ]
  },
  nodesConnector: {
    $kind: '$library/NodeGraph/NodesConnector',
    $inputs: [
      {pipeline: 'selectedPipeline'},
      'selectedNode',
      'nodeTypes',
    ],
    $outputs: [
      {pipeline: 'selectedPipeline'},
      'selectedNode',
      'recipes'
    ]
  }
};
