/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {nodeTypes} from './nodeTypes.js';
import {NodeCatalogParticles, NodeCatalogStores} from '../../Library/FlowGraph/NodeCatalog/NodeCatalogSpecs.js';

export const StudioRecipe = {
  $meta: {
    description: 'Studio Recipe'
  },
  $stores: {
    selectedPipeline: {
      $type: 'Pojo',
      $tags: ['persisted'],
      $value: null
    },
    selectedNode: {
      $type: 'Pojo'
    },
    nodeTypes: {
      $type: 'Pojo',
      $value: nodeTypes
    },
    inspectorData: {
      $type: 'Pojo'
    },
    recipes: {
      $type: 'Pojo',
      $value: []
    },
    ...NodeCatalogStores
  },
  main: {
    $container: '#user',
    $kind: '$app/Library/Studio',
    $inputs: [
      {pipeline: 'selectedPipeline'}
    ],
    $outputs: [
      {pipeline: 'selectedPipeline'}
    ],
    $slots: {
      // actually a slot in main
      editor: {
        Editor: {
          $kind: '$library/FlowGraph/NodeGraph/Editor',
          $inputs: [
            {pipeline: 'selectedPipeline'},
            'selectedNode',
            'nodeTypes'
          ],
          $outputs: [
            {pipeline: 'selectedPipeline'},
            'selectedNode'
          ]
        }
      },
      // uses #container override to project elsewhere
      catalog: {
        ...NodeCatalogParticles,
        ...{
          NodeCatalog: {
            ...NodeCatalogParticles.NodeCatalog,
            $container: '#catalog'
          }
        }
      },
      // uses #container override to project elsewhere
      inspector: {
        Inspector: {
          $container: '#inspector',
          $kind: '$library/FlowGraph/NodeGraph/Inspector',
          $inputs: [{data: 'inspectorData'}],
          $outputs: [{data: 'inspectorData'}]
        }
      }
    }
  },
  nodeInspector: {
    $kind: '$library/FlowGraph/NodeGraph/NodeInspector',
    $inputs: [
      {node: 'selectedNode'},
      {pipeline: 'selectedPipeline'},
      'nodeTypes',
    ],
    $outputs: [
      {data: 'inspectorData'}
    ]
  },
  nodeUpdator: {
    $kind: '$library/FlowGraph/NodeGraph/NodeUpdator',
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
    $kind: '$library/FlowGraph/NodeGraph/NodesConnector',
    $inputs: [
      {pipeline: 'selectedPipeline'},
      'selectedNode',
      'nodeTypes'
    ],
    $outputs: [
      {pipeline: 'selectedPipeline'},
      'selectedNode',
      'recipes'
    ]
  }
};
