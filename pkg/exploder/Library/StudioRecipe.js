/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {nodeTypes} from './nodeTypes.js';
import {NodeCatalogRecipe} from '../../Library/NodeCatalog/NodeCatalogRecipe.js';

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
      {pipeline: 'selectedPipeline'},
      'selectedNode',
      'nodeTypes'
    ],
    $outputs: [
      {pipeline: 'selectedPipeline'},
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
    $inputs: [{pipeline: 'selectedPipeline'}],
    $outputs: [{pipeline: 'selectedPipeline'}],
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
      {pipeline: 'selectedPipeline'},
      'nodeTypes',
    ],
    $outputs: [{data: 'inspectorData'}]
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
      'nodeTypes'
    ],
    $outputs: [
      {pipeline: 'selectedPipeline'},
      'selectedNode',
      'recipes'
    ]
  }
};
