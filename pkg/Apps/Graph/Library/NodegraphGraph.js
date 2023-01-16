/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {NodeCatalogNode} from '../../../Library/Node/NodeCatalogNode.js';
import {GraphToolbarNode} from './GraphToolbarNode.js';
import {NodeEditorNode} from './NodeEditorNode.js';
import {GraphBuilderNode} from './GraphBuilderNode.js';
import {InspectorNode} from './InspectorNode.js';

const Preview = {
  designer: {
    $kind: '$library/Node/NodeDesigner',
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

const NodeTreeNode = {
  NodeTree: {
    $kind: '$library/Node/NodeTree',
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

const NodeCreatorNode = {
  // combiner: {
  //   $kind: '$library/Node/NodeTypesCombiner',
  //   $inputs: ['builtinNodeTypes', 'selectedGraph'],
  //   $outputs: [{results: 'nodeTypes'}, 'selectedGraph']
  // },
  creator: {
    $kind: '$library/Node/NodeCreator',
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

const NodegraphNode = {
  $meta: {
    description: 'Node Graph',
    id: 'NodegraphNode'
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
    designInfo: {
      $type: 'DesignInfo'
    },
    selectedNodeId: {
      $type: 'String'
    },
    candidates: {
      $type: 'Pojo'
    },
    builtinNodeTypes: {
      $type: 'Pojo',
      //$value: nodeTypes
    },
    inspectorData: {
      $type: 'Pojo'
    },
    categories: {
      $type: 'Pojo',
      //$value: categories
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
      catalog: NodeCatalogNode,
      toolbar: GraphToolbarNode,
      editor: NodeEditorNode,
      inspector: InspectorNode,
      tree: NodeTreeNode,
      builder: GraphBuilderNode,
      creator: NodeCreatorNode
    }
  },
};

export const NodegraphGraph = {
  $meta: {
    id: 'nodegraph-app',
    name: 'nodegraph-app'
  },
  nodes: [{
    type: 'NodegraphNode'
  }]
};

export const nodegraphNodeTypes = {NodegraphNode};
