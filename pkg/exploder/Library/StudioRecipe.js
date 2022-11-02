/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {nodeTypes} from './nodeTypes.js';
import {NodeCatalogRecipe} from '../../Library/NodeTypeCatalog/NodeCatalogRecipe.js';

const catalog = {
  ...NodeCatalogRecipe,
  NodeCatalog: {
    ...NodeCatalogRecipe.NodeCatalog,
    $container: '#catalog'
  }
};

const editor = {
  Editor: {
    $kind: '$library/NodeGraph/Editor',
    $inputs: [
      {graph: 'selectedPipeline'},
      'selectedNode',
      'nodeTypes'
    ],
    $outputs: [
      {graph: 'selectedPipeline'},
      'selectedNode'
    ]
  }
};

const inspector = {
  Inspector: {
    $container: '#inspector',
    $kind: '$library/NodeGraph/Inspector',
    $inputs: [{data: 'inspectorData'}],
    $outputs: [{data: 'inspectorData'}]
  }
};

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
    }
  },
  main: {
    $container: '#user',
    $kind: '$app/Library/Studio',
    $inputs: [{graph: 'selectedPipeline'}],
    $outputs: [{graph: 'selectedPipeline'}],
    $slots: {
      editor,
      catalog,
      inspector
    }
  },
  nodeInspector: {
    $kind: '$library/NodeGraph/NodeInspector',
    $inputs: [
      {node: 'selectedNode'},
      {graph: 'selectedPipeline'},
      'nodeTypes',
    ],
    $outputs: [{data: 'inspectorData'}]
  },
  nodeUpdater: {
    $kind: '$library/NodeGraph/NodeUpdater',
    $inputs: [
      {node: 'selectedNode'},
      {graph: 'selectedPipeline'},
      {data: 'inspectorData'}
    ],
    $outputs: [
      {node: 'selectedNode'},
      {graph: 'selectedPipeline'},
    ]
  },
  nodesConnector: {
    $kind: '$library/NodeGraph/NodesConnector',
    $inputs: [
      {graph: 'selectedPipeline'},
      'selectedNode',
      'nodeTypes'
    ],
    $outputs: [
      {graph: 'selectedPipeline'},
      'selectedNode',
      'recipes'
    ]
  }
};
