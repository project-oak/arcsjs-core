/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {nodeTypes, categories} from './nodeTypes.js';
import {customInspectors} from './customInspectors.js';
import {NodeCatalogRecipe} from '../../Library/NodeTypeCatalog/NodeCatalogRecipe.js';

const globalStores = [
  'selectedNode',
  'selectedPipeline',
  'nodeTypes',
  'categories',
  'nodeId',
];

const PipelineToolbar = {
  $stores: {
    pipelineToolbarEvent: {
      $type: 'String'
    },
    pipelineToolbarIcons: {
      $type: '[Pojo]'
    }
  },
  pipelineToolbar: {
    $kind: '$library/NodeGraph/PipelineToolbar',
    $inputs: [
      {pipeline: 'selectedPipeline'},
      'pipelines',
      {event: 'pipelineToolbarEvent'}
    ],
    $staticInputs: {
      publishPaths: {}
    },
    $outputs: [
      {pipeline: 'selectedPipeline'},
      'selectedNodeId',
      'pipelines',
      {icons: 'pipelineToolbarIcons'},
      {event: 'pipelineToolbarEvent'}
    ],
    $slots: {
      buttons: {
        PipelineButtons: {
          $kind: '$library/NodeGraph/Toolbar',
          $inputs: [{icons: 'pipelineToolbarIcons'}],
          $outputs: [{event: 'pipelineToolbarEvent'}],
        }
      },
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
  }
};

const Preview = {
  designer: {
    $kind: '$library/Designer/Designer',
    $inputs: [
      'recipes',
      {pipeline: 'selectedPipeline'},
      'selectedNodeId',
      'nodeTypes',
      'categories',
      {layout: 'previewLayout'},
      'newNodeInfos'
    ],
    $outputs: [
      {pipeline: 'selectedPipeline'},
      'selectedNodeId',
      {layout: 'previewLayout'},
      'newNodeInfos'
    ]
  }
};

const NodeEditor = {
  $stores: {
    editorToolbarEvent: {
      $type: 'String'
    },
    editorToolbarIcons: {
      $type: '[Pojo]'
    },
  },
  Editor: {
    // $kind: 'http://localhost:9876/Library/Editor',
    // $kind: '$library/NodeGraph/SimpleEditor',
    $kind: '$library/NodeGraph/Editor',
    $inputs: [
      'recipes',
      {pipeline: 'selectedPipeline'},
      'selectedNodeId',
      'nodeTypes',
      'categories',
      {layout: 'nodegraphLayout'},
      {previewLayout: 'previewLayout'},
      'newNodeInfos',
      {event: 'editorToolbarEvent'}
    ],
    $outputs: [
      {pipeline: 'selectedPipeline'},
      'selectedNodeId',
      {layout: 'nodegraphLayout'},
      {previewLayout: 'previewLayout'},
      'newNodeInfos',
      {event: 'editorToolbarEvent'},
      'editorToolbarIcons'
    ],
    $slots: {
      toolbar: {
        editorToolbar: {
          $kind: '$library/NodeGraph/Toolbar',
          $inputs: [{icons: 'editorToolbarIcons'}],
          $outputs: [{event: 'editorToolbarEvent'}]
        }
      }
    }
  }
};

const Inspector = {
  Inspector: {
    $kind: '$library/NodeGraph/Inspector',
    $staticInputs: {customInspectors},
    $inputs: [{data: 'inspectorData'}],
    $outputs: [{data: 'inspectorData'}]
  },
  nodeInspector: {
    $kind: '$library/NodeGraph/NodeInspector',
    $staticInputs: {
      customInspectors,
      inspectorData: 'inspectorData',
    },
    $inputs: [
      'selectedNodeId',
      {pipeline: 'selectedPipeline'},
      'candidates',
      'nodeTypes'
    ],
    $outputs: [{data: 'inspectorData'}]
  },
  nodeUpdater: {
    $kind: '$library/NodeGraph/NodeUpdater',
    $inputs: [
      'selectedNodeId',
      {pipeline: 'selectedPipeline'},
      {data: 'inspectorData'}
    ],
    $outputs: [
      'selectedNodeId',
      {pipeline: 'selectedPipeline'}
    ]
  }
};

const NodeTree = {
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
};

export const NodeCreator = {
  combiner: {
    $kind: '$library/NodeGraph/NodeTypesCombiner',
    $inputs: ['builtinNodeTypes', 'selectedPipeline'],
    $outputs: [{results: 'nodeTypes'}, 'selectedPipeline']
  },
  creator: {
    $kind: '$library/NodeGraph/NodeCreator',
    $inputs: [
      'newNodeInfos',
      'nodeTypes',
      {pipeline: 'selectedPipeline'}
    ],
    $outputs: [
      'newNodeInfos',
      {pipeline: 'selectedPipeline'},
      'selectedNodeId'
    ]
  }
};

const Layout = {
  layoutInitializer: {
    $kind: '$library/NodeGraph/LayoutInitializer',
    $inputs: [
      {pipeline: 'selectedPipeline'},
      'previewLayout',
      'nodegraphLayout'
    ],
    $outputs: [
      'previewLayout',
      'nodegraphLayout'
    ]
  },
  layoutUpdater: {
    $kind: '$library/NodeGraph/LayoutUpdater',
    $inputs: [
      {pipeline: 'selectedPipeline'},
      'previewLayout',
      'nodegraphLayout'
    ],
    $outputs: [{pipeline: 'selectedPipeline'}]
  }
};

const RecipeBuilder = {
  candidateFinder: {
    $kind: '$library/NodeGraph/CandidateFinder',
    $inputs: [
      {pipeline: 'selectedPipeline'},
      'nodeTypes'
    ],
    $staticInputs: {globalStores},
    $outputs: ['candidates']
  },
  connectionUpdater: {
    $kind: '$library/NodeGraph/ConnectionUpdater',
    $inputs: [
      {pipeline: 'selectedPipeline'},
      'nodeTypes',
      'candidates',
    ],
    $outputs: [{pipeline: 'selectedPipeline'}]
  },
  recipeBuilder: {
    $kind: '$library/NodeGraph/RecipeBuilder',
    $inputs: [
      'nodeTypes',
      {pipeline: 'selectedPipeline'},
      {layout: 'previewLayout'}
    ],
    $outputs: ['recipes']
  }
};

export const NodegraphRecipe = {
  $meta: {
    description: 'Node Editor Recipe'
  },
  $stores: {
    pipelines: {
      $type: '[Pojo]',
      $tags: ['persisted'],
      $value: []
    },
    selectedPipeline: {
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
    recipes: {
      $type: '[Pojo]',
      $value: []
    },
    categories: {
      $type: 'Pojo',
      $value: categories
    },
    previewLayout: {
      $type: 'Pojo'
    },
    nodegraphLayout: {
      $type: 'Pojo'
    },
    nodeTypes: {
      $type: 'Pojo',
      $value: nodeTypes
    },
    newNodeInfos: {
      $type: '[Pojo]'
    }
  },
  ...RecipeBuilder,
  ...Layout,
  ...NodeCreator,
  main: {
    $kind: '$nodegraph/Nodegraph',
    $slots: {
      catalog: NodeCatalogRecipe,
      toolbar: PipelineToolbar,
      preview: Preview,
      editor: NodeEditor,
      inspector: Inspector,
      tree: NodeTree
    }
  },
};
