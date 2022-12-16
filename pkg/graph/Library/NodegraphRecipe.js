/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {nodeTypes, categories} from './nodeTypes.js';
import {customInspectors} from './customInspectors.js';

export {nodeTypes};

const globalStores = [
  'selectedNode',
  'selectedGraph',
  'nodeTypes',
  'categories',
  'nodeId',
];

const GraphToolbar = {
  $stores: {
    graphToolbarEvent: {
      $type: 'String'
    },
    graphToolbarIcons: {
      $type: '[Pojo]'
    }
  },
  graphToolbar: {
    $kind: '$library/NodeGraph/GraphToolbar',
    $inputs: [
      {graph: 'selectedGraph'},
      'graphs',
      {event: 'graphToolbarEvent'}
    ],
    $staticInputs: {
      publishPaths: {}
    },
    $outputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId',
      'graphs',
      {icons: 'graphToolbarIcons'},
      {event: 'graphToolbarEvent'}
    ],
    $slots: {
      buttons: {
        GraphButtons: {
          $kind: '$library/NodeGraph/Toolbar',
          $inputs: [{icons: 'graphToolbarIcons'}],
          $outputs: [{event: 'graphToolbarEvent'}],
        }
      },
      chooser: {
        GraphChooser: {
          $kind: '$library/NodeGraph/GraphChooser',
          $inputs: [
            {graph: 'selectedGraph'},
            'graphs'
          ],
          $outputs: [{graph: 'selectedGraph'}]
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
      {graph: 'selectedGraph'},
      'selectedNodeId',
      'nodeTypes',
      'categories',
      {layout: 'previewLayout'},
      'newNodeInfos'
    ],
    $outputs: [
      {graph: 'selectedGraph'},
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
      {graph: 'selectedGraph'},
      'selectedNodeId',
      'nodeTypes',
      'categories',
      {layout: 'nodegraphLayout'},
      {previewLayout: 'previewLayout'},
      'newNodeInfos',
      {event: 'editorToolbarEvent'}
    ],
    $outputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId',
      {layout: 'nodegraphLayout'},
      //{previewLayout: 'previewLayout'},
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
    $kind: '$library/NodeInspector/ObjectInspector',
    $staticInputs: {customInspectors},
    $inputs: [{data: 'inspectorData'}],
    $outputs: [{data: 'inspectorData'}]
  },
  nodeInspector: {
    $kind: '$library/NodeInspector/NodeInspector',
    $staticInputs: {
      customInspectors,
      inspectorData: 'inspectorData',
    },
    $inputs: [
      'selectedNodeId',
      {graph: 'selectedGraph'},
      'candidates',
      'nodeTypes'
    ],
    $outputs: [{data: 'inspectorData'}]
  },
  nodeUpdater: {
    $kind: '$library/NodeInspector/NodeUpdater',
    $inputs: [
      'selectedNodeId',
      {graph: 'selectedGraph'},
      {data: 'inspectorData'}
    ],
    $outputs: [
      'selectedNodeId',
      {graph: 'selectedGraph'}
    ]
  }
};

const NodeTree = {
  NodeTree: {
    $kind: '$library/NodeTree/NodeTree',
    $inputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId',
      'nodeTypes',
      'categories',
      {layout: 'previewLayout'}
    ],
    $outputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId',
      {layout: 'previewLayout'}
    ]
  }
};

export const NodeCreator = {
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

const Layout = {
  layoutInitializer: {
    $kind: '$library/NodeLayout/LayoutInitializer',
    $inputs: [
      {graph: 'selectedGraph'},
      'previewLayout',
      'nodegraphLayout'
    ],
    $outputs: [
      'previewLayout',
      'nodegraphLayout'
    ]
  },
  layoutUpdater: {
    $kind: '$library/NodeLayout/LayoutUpdater',
    $inputs: [
      {graph: 'selectedGraph'},
      'previewLayout',
      'nodegraphLayout'
    ],
    $outputs: [{graph: 'selectedGraph'}]
  }
};

const RecipeBuilder = {
  candidateFinder: {
    $kind: '$library/RecipeBuilder/CandidateFinder',
    $inputs: [
      {graph: 'selectedGraph'},
      'nodeTypes'
    ],
    $staticInputs: {globalStores},
    $outputs: ['candidates']
  },
  connectionUpdater: {
    $kind: '$library/RecipeBuilder/ConnectionUpdater',
    $inputs: [
      {graph: 'selectedGraph'},
      'nodeTypes',
      'candidates',
    ],
    $outputs: [{graph: 'selectedGraph'}]
  },
  recipeBuilder: {
    $kind: '$library/RecipeBuilder/RecipeBuilderParticle',
    $inputs: [
      'nodeTypes',
      {graph: 'selectedGraph'},
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
    $kind: '$library/NodeGraph/Nodegraph',
    $slots: {
      catalog: nodeTypes.NodeCatalogNode, //Recipe,
      toolbar: GraphToolbar,
      preview: Preview,
      editor: NodeEditor,
      inspector: Inspector,
      tree: NodeTree
    }
  },
};
