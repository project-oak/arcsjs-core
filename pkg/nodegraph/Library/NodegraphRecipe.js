/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {nodeTypes, categories} from './nodeTypes.js';
import {customInspectors} from './customInspectors.js';
import {NodeCatalogRecipe} from '../../Library/NodeTypeCatalog/NodeCatalogRecipe.js';
import {DeviceUxRecipe} from '../../Library/Media/DeviceUxRecipe.js';

const globalStores = [
  'selectedNode',
  'selectedGraph',
  'nodeTypes',
  'categories',
  'nodeId',
  'mediaDevices',
  'mediaDeviceState'
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
      {event: 'graphToolbarEvent'},
      'mediaDeviceState'
    ],
    $staticInputs: {
      publishPaths: {}
    },
    $outputs: [
      {graph: 'selectedGraph'},
      'selectedNodeId',
      'graphs',
      {icons: 'graphToolbarIcons'},
      {event: 'graphToolbarEvent'},
      'mediaDeviceState'
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
      'recipes',
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
      {graph: 'selectedGraph'},
      'candidates',
      'nodeTypes'
    ],
    $outputs: [{data: 'inspectorData'}]
  },
  nodeUpdater: {
    $kind: '$library/NodeGraph/NodeUpdater',
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
    $kind: '$library/NodeGraph/NodeTree',
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
    $kind: '$library/NodeGraph/LayoutInitializer',
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
    $kind: '$library/NodeGraph/LayoutUpdater',
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
    $kind: '$library/NodeGraph/CandidateFinder',
    $inputs: [
      {graph: 'selectedGraph'},
      'nodeTypes'
    ],
    $staticInputs: {globalStores},
    $outputs: ['candidates']
  },
  connectionUpdater: {
    $kind: '$library/NodeGraph/ConnectionUpdater',
    $inputs: [
      {graph: 'selectedGraph'},
      'nodeTypes',
      'candidates',
    ],
    $outputs: [{graph: 'selectedGraph'}]
  },
  recipeBuilder: {
    $kind: '$library/NodeGraph/RecipeBuilder',
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
    },
    mediaDevices: DeviceUxRecipe.$stores.mediaDevices,
    mediaDeviceState: DeviceUxRecipe.$stores.mediaDeviceState
  },
  ...RecipeBuilder,
  ...Layout,
  ...NodeCreator,
  main: {
    $kind: '$nodegraph/Nodegraph',
    $slots: {
      catalog: NodeCatalogRecipe,
      toolbar: GraphToolbar,
      preview: Preview,
      editor: NodeEditor,
      inspector: Inspector,
      tree: NodeTree,
      device: {
        defaultStream: DeviceUxRecipe.defaultStream
      }
    }
  },
};
