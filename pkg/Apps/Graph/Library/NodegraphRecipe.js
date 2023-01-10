/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {nodeTypes, categories} from '../nodeTypes.js';
import {GraphToolbarRecipe} from './GraphToolbarRecipe.js';
import {NodeEditorRecipe} from './NodeEditorRecipe.js';
import {RecipeBuilderRecipe} from './RecipeBuilderRecipe.js';
import {InspectorRecipe} from './InspectorRecipe.js';

export {nodeTypes};

const Preview = {
  designer: {
    $kind: '$library/Designer/Designer',
    $inputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId',
      'nodeTypes',
      'categories',
      'newNodeInfos'
    ],
    $staticInputs: {
      layoutId: 'preview'
    },
    $outputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId',
      'newNodeInfos'
    ]
  }
};

const NodeTreeRecipe = {
  NodeTree: {
    $kind: '$library/NodeTree/NodeTree',
    $inputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId',
      'nodeTypes',
      'categories'
    ],
    $staticInputs: {
      layoutId: 'preview'
    },
    $outputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId'
    ]
  }
};

const NodeCreatorRecipe = {
  combiner: {
    $kind: '$library/NodeGraph/NodeTypesCombiner',
    $inputs: ['builtinNodeTypes', 'selectedGraph'],
    $outputs: [{results: 'nodeTypes'}, 'selectedGraph']
  },
  creator: {
    $kind: '$library/NodeGraph/NodeCreator',
    $inputs: [
      'newNodeInfos',
      'nodeTypes',
      {graph: 'selectedGraph'}
    ],
    $outputs: [
      'newNodeInfos',
      {graph: 'selectedGraph'},
      'selectedNodeId'
    ]
  }
};

const NodegraphRecipe = {
  $meta: {
    description: 'Node Editor Recipe',
    id: 'NodegraphRecipe'
  },
  $stores: {
    graphs: {
      $type: '[Pojo]',
      $tags: ['persisted'],
      $value: []
    },
    selectedGraph: {
      $type: 'Pojo',
      $tags: ['persisted'],
      $value: null
    },
    selectedNodeId: {
      $type: 'String'
    },
    candidates: {
      $type: 'Pojo'
    },
    builtinNodeTypes: {
      $type: 'Pojo',
      $value: nodeTypes
    },
    inspectorData: {
      $type: 'Pojo'
    },
    categories: {
      $type: 'Pojo',
      $value: categories
    },
    nodeTypes: {
      $type: 'Pojo',
      $value: {}
    },
    newNodeInfos: {
      $type: '[Pojo]'
    }
  },
  main: {
    $kind: '$library/NodeGraph/Nodegraph',
    $slots: {
      preview: Preview,
      catalog: nodeTypes.NodeCatalogNode,
      toolbar: GraphToolbarRecipe,
      editor: NodeEditorRecipe,
      inspector: InspectorRecipe,
      tree: NodeTreeRecipe,
      builder: RecipeBuilderRecipe,
      creator: NodeCreatorRecipe
    }
  },
};

export const NodegraphGraph = {
  $meta: {
    id: 'nodegraph-app',
    name: 'nodegraph-app'
  },
  nodes: [{
    type: 'NodegraphRecipe'
  }]
};

export const nodegraphNodeTypes = {NodegraphRecipe};
