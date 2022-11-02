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
      {graph: 'selectedPipeline'},
      'pipelines',
      {event: 'pipelineToolbarEvent'}
    ],
    $staticInputs: {
      publishPaths: {}
    },
    $outputs: [
      {graph: 'selectedPipeline'},
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
            {graph: 'selectedPipeline'},
            'pipelines'
          ],
          $outputs: [{graph: 'selectedPipeline'}]
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
      {graph: 'selectedPipeline'},
      'selectedNodeId',
      'nodeTypes',
      'categories',
      {layout: 'previewLayout'},
      'newNodeInfos'
    ],
    $outputs: [
      {graph: 'selectedPipeline'},
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
      {graph: 'selectedPipeline'},
      'selectedNodeId',
      'nodeTypes',
      'categories',
      {layout: 'nodegraphLayout'},
      {previewLayout: 'previewLayout'},
      'newNodeInfos',
      {event: 'editorToolbarEvent'}
    ],
    $outputs: [
      {graph: 'selectedPipeline'},
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
      {graph: 'selectedPipeline'},
      'candidates',
      'nodeTypes'
    ],
    $outputs: [{data: 'inspectorData'}]
  },
  nodeUpdater: {
    $kind: '$library/NodeGraph/NodeUpdater',
    $inputs: [
      'selectedNodeId',
      {graph: 'selectedPipeline'},
      {data: 'inspectorData'}
    ],
    $outputs: [
      'selectedNodeId',
      {graph: 'selectedPipeline'}
    ]
  }
};

const NodeTree = {
  NodeTree: {
    $kind: '$library/NodeGraph/NodeTree',
    $inputs: [
      {graph: 'selectedPipeline'},
      'selectedNodeId',
      'nodeTypes',
      'categories',
      {layout: 'previewLayout'}
    ],
    $outputs: [
      {graph: 'selectedPipeline'},
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
      {graph: 'selectedPipeline'}
    ],
    $outputs: [
      'newNodeInfos',
      {graph: 'selectedPipeline'},
      'selectedNodeId'
    ]
  }
};

const Layout = {
  layoutInitializer: {
    $kind: '$library/NodeGraph/LayoutInitializer',
    $inputs: [
      {graph: 'selectedPipeline'},
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
      {graph: 'selectedPipeline'},
      'previewLayout',
      'nodegraphLayout'
    ],
    $outputs: [{graph: 'selectedPipeline'}]
  }
};

const RecipeBuilder = {
  candidateFinder: {
    $kind: '$library/NodeGraph/CandidateFinder',
    $inputs: [
      {graph: 'selectedPipeline'},
      'nodeTypes'
    ],
    $staticInputs: {globalStores},
    $outputs: ['candidates']
  },
  connectionUpdater: {
    $kind: '$library/NodeGraph/ConnectionUpdater',
    $inputs: [
      {graph: 'selectedPipeline'},
      'nodeTypes',
      'candidates',
    ],
    $outputs: [{graph: 'selectedPipeline'}]
  },
  recipeBuilder: {
    $kind: '$library/NodeGraph/RecipeBuilder',
    $inputs: [
      'nodeTypes',
      {graph: 'selectedPipeline'},
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
