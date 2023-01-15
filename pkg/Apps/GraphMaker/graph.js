/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const graph = {
  "$meta": {
    "name": "illiterate-recommendation",
    "id": "5435-1803-2113"
  },
  "nodes": {
    "SplitPanelNode1": {
      "id": "SplitPanelNode1",
      "type": "SplitPanelNode",
      "displayName": "Split Panel",
      "connections": {},
      "props": {
        "layout": "vertical",
        "endflex": true,
        "divider": 232
      }
    },
    "NodeCatalogNode1": {
      "id": "NodeCatalogNode1",
      "type": "NodeCatalogNode",
      "displayName": "Node Catalog",
      "connections": {
        "nodeTypes": [
          "nodeTypes",
          "NodeInspectorNode1undefinedinspectorData"
        ],
        "categories": [
          "categories",
          "NodeInspectorNode1undefinedinspectorData"
        ],
        "newNodeInfos": [
          "NodeInspectorNode1undefinedinspectorData"
        ],
        "selectedGraph": [
          "selectedGraph",
          "NodeInspectorNode1undefinedinspectorData"
        ],
        "hoveredNodeType": [
          "NodeInspectorNode1undefinedinspectorData"
        ]
      }
    },
    "SplitPanelNode2": {
      "id": "SplitPanelNode2",
      "type": "SplitPanelNode",
      "displayName": "Split Panel 2",
      "connections": {},
      "props": {
        "layout": "vertical"
      }
    },
    "NodeInspectorNode1": {
      "id": "NodeInspectorNode1",
      "type": "NodeInspectorNode",
      "displayName": "Node Inspector",
      "connections": {},
      "props": {}
    },
    "NodeTreeNode1": {
      "id": "NodeTreeNode1",
      "type": "NodeTreeNode",
      "displayName": "Node Tree"
    },
    "SplitPanelNode3": {
      "id": "SplitPanelNode3",
      "type": "SplitPanelNode",
      "displayName": "Split Panel 3",
      "connections": {},
      "props": {
        "layout": "horizontal",
        "endflex": false,
        "divider": 0
      }
    },
    "SplitPanelNode4": {
      "id": "SplitPanelNode4",
      "type": "SplitPanelNode",
      "displayName": "Split Panel 4",
      "connections": {},
      "props": {}
    },
    "NodeDesignerNode1": {
      "id": "NodeDesignerNode1",
      "type": "NodeDesignerNode",
      "displayName": "Node Designer"
    },
    "NodeEditorNode1": {
      "id": "NodeEditorNode1",
      "type": "NodeEditorNode",
      "displayName": "Node Editor",
      "connections": {},
      "props": {}
    },
    "DisplayNode1": {
      "id": "DisplayNode1",
      "type": "DisplayNode",
      "displayName": "Display",
      "connections": {},
      "props": {
        "text": "AnnAppolis",
        "textStyle": "background: lightblue; padding: 24px; font-size: 1.5em; font-weight: bold; height: auto !important; flex: none !important;"
      }
    },
    "SplitPanelNode5": {
      "id": "SplitPanelNode5",
      "type": "SplitPanelNode",
      "displayName": "Split Panel 5",
      "connections": {},
      "props": {
        "endflex": true,
        "divider": 76
      }
    }
  },
  "layout": {
    "preview": {
      "NodeCatalogNode1:Container": "SplitPanelNode1:panel#FirstContainer",
      "SplitPanelNode2:Container": "SplitPanelNode1:panel#SecondContainer",
      "NodeInspectorNode1:Container": "SplitPanelNode4:panel#FirstContainer",
      "NodeTreeNode1:Container": "SplitPanelNode4:panel#SecondContainer",
      "SplitPanelNode4:Container": "SplitPanelNode2:panel#SecondContainer",
      "SplitPanelNode3:Container": "SplitPanelNode2:panel#FirstContainer",
      "NodeDesignerNode1:Container": "SplitPanelNode3:panel#FirstContainer",
      "NodeEditorNode1:Container": "SplitPanelNode3:panel#SecondContainer",
      "SplitPanelNode1:Container": "SplitPanelNode5:panel#SecondContainer",
      "DisplayNode1:Container": "SplitPanelNode5:panel#FirstContainer"
    },
    "nodegraph": {
      "SplitPanelNode1": {
        "l": -1188,
        "t": -2048,
        "w": 144,
        "h": 116
      },
      "NodeCatalogNode1": {
        "l": 22,
        "t": 216,
        "w": 128,
        "h": 96
      },
      "SplitPanelNode2": {
        "l": 336,
        "t": 3464,
        "w": 144,
        "h": 80
      },
      "NodeInspectorNode1": {
        "l": 383,
        "t": 75,
        "w": 144,
        "h": 112
      },
      "DesignerNode1": {
        "l": 552,
        "t": 48,
        "w": 176,
        "h": 112
      },
      "EditorNode1": {
        "l": 384,
        "t": 176,
        "w": 144,
        "h": 136
      },
      "NodeTreeNode1": {
        "l": 198,
        "t": 65,
        "w": 144,
        "h": 80
      },
      "SplitPanelNode3": {
        "l": 383,
        "t": 215,
        "w": 128,
        "h": 116
      },
      "SplitPanelNode4": {
        "l": 28,
        "t": 75,
        "w": 144,
        "h": 116
      },
      "NodeDesignerNode1": {
        "l": 384,
        "t": -784,
        "w": 144,
        "h": 80
      },
      "NodeEditorNode1": {
        "l": 198.00006103515625,
        "t": 169,
        "w": 144,
        "h": 63.984375
      },
      "DisplayNode1": {
        "l": 1376,
        "t": 4232,
        "w": 144,
        "h": 80
      }
    }
  }
};

export const graph1 =
{
  "$meta": {
    "name": "unripe-annual",
    "id": "2577-5784-1061"
  },
  "nodes": {
    "NodeCatalogNode1": {
      "id": "NodeCatalogNode1",
      "type": "NodeCatalogNode",
      "displayName": "Node Catalog",
      "props": {}
    },
    "SplitPanelNode1": {
      "id": "SplitPanelNode1",
      "type": "SplitPanelNode",
      "displayName": "LeftPanel",
      "connections": {},
      "props": {
        "layout": "vertical",
        "style": "position: static; flex: 1 !important; background: red;"
      }
    },
    "SplitPanelNode2": {
      "id": "SplitPanelNode2",
      "type": "SplitPanelNode",
      "displayName": "MiddlePanel",
      "connections": {},
      "props": {
        "layout": "vertical"
      }
    },
    "SplitPanelNode3": {
      "id": "SplitPanelNode3",
      "type": "SplitPanelNode",
      "displayName": "RightPanel",
      "connections": {},
      "props": {}
    },
    "NodeInspectorNode1": {
      "id": "NodeInspectorNode1",
      "type": "NodeInspectorNode",
      "displayName": "Node Inspector",
      "connections": {},
      "props": {}
    }
  },
  "layout": {
    "preview": {
      "SplitPanelNode1": {
        "l": 32,
        "t": 24,
        "w": 680,
        "h": 392
      },
      "NodeCatalogNode1:Container": "SplitPanelNode1:panel#FirstContainer",
      "SplitPanelNode2:Container": "SplitPanelNode1:panel#SecondContainer",
      "SplitPanelNode3:Container": "SplitPanelNode2:panel#SecondContainer",
      "NodeInspectorNode1:Container": "SplitPanelNode3:panel#FirstContainer"
    },
    "nodegraph": {
      "SplitPanelNode1": {
        "l": 200,
        "t": 64,
        "w": 144,
        "h": 80
      },
      "NodeCatalogNode1": {
        "l": 32,
        "t": 64,
        "w": 144,
        "h": 80
      },
      "SplitPanelNode2": {
        "l": 200,
        "t": 160,
        "w": 144,
        "h": 80
      },
      "SplitPanelNode3": {
        "l": 368,
        "t": 160,
        "w": 144,
        "h": 80
      },
      "NodeInspectorNode1": {
        "l": 536,
        "t": 160,
        "w": 144,
        "h": 80
      }
    }
  }
};