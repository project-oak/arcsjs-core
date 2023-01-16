/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const graph = {
  "$meta": {
    "name": "idolized-voice",
    "id": "8291-2052-6799"
  },
  "nodes": {
    "NodeCatalogNode1": {
      "id": "NodeCatalogNode1",
      "type": "NodeCatalogNode",
      "displayName": "Node Catalog",
      "connections": {
        "nodeTypes": [
          "NodeTypesNode2:NodeTypes"
        ]
      },
      "props": {}
    },
    "SplitPanelNode1": {
      "id": "SplitPanelNode1",
      "type": "SplitPanelNode",
      "displayName": "Main Panel",
      "connections": {},
      "props": {
        "layout": "vertical"
      }
    },
    "SplitPanelNode2": {
      "id": "SplitPanelNode2",
      "type": "SplitPanelNode",
      "displayName": "Edit Panel",
      "connections": {},
      "props": {}
    },
    "SplitPanelNode3": {
      "id": "SplitPanelNode3",
      "type": "SplitPanelNode",
      "displayName": "ColumnsPanel",
      "connections": {},
      "props": {
        "layout": "vertical"
      }
    },
    "SplitPanelNode4": {
      "id": "SplitPanelNode4",
      "type": "SplitPanelNode",
      "displayName": "ToolsPanel",
      "connections": {},
      "props": {}
    },
    "NodeInspectorNode1": {
      "id": "NodeInspectorNode1",
      "type": "NodeInspectorNode",
      "displayName": "Node Inspector",
      "connections": {},
      "props": {}
    },
    "NodeTypesNode2": {
      "id": "NodeTypesNode2",
      "type": "NodeTypesNode",
      "displayName": "Node Types",
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
    "NodeTreeNode1": {
      "id": "NodeTreeNode1",
      "type": "NodeTreeNode",
      "displayName": "Node Tree"
    }
  },
  "layout": {
    "nodegraph": {
      "NodeCatalogNode1": {
        "l": 76,
        "t": 116,
        "w": 140,
        "h": 60
      },
      "SplitPanelNode1": {
        "l": 337,
        "t": 18,
        "w": 140,
        "h": 116
      },
      "SplitPanelNode2": {
        "l": 374,
        "t": 51,
        "w": 140,
        "h": 116
      },
      "SplitPanelNode3": {
        "l": 415,
        "t": 82,
        "w": 140,
        "h": 116
      },
      "SplitPanelNode4": {
        "l": 447,
        "t": 119,
        "w": 140,
        "h": 116
      },
      "NodeInspectorNode1": {
        "l": 78,
        "t": 192,
        "w": 140,
        "h": 60
      },
      "NodeTypesNode2": {
        "l": 73,
        "t": 42,
        "w": 140,
        "h": 60
      },
      "NodeDesignerNode1": {
        "l": 77,
        "t": 263,
        "w": 140,
        "h": 76
      },
      "NodeEditorNode1": {
        "l": 79,
        "t": 349,
        "w": 140,
        "h": 60
      }
    },
    "preview": {
      "NodeCatalogNode1:Container": "SplitPanelNode1:panel#FirstContainer",
      "SplitPanelNode2:Container": "SplitPanelNode3:panel#FirstContainer",
      "SplitPanelNode3:Container": "SplitPanelNode1:panel#SecondContainer",
      "SplitPanelNode4:Container": "SplitPanelNode3:panel#SecondContainer",
      "NodeInspectorNode1:Container": "SplitPanelNode4:panel#FirstContainer",
      "NodeDesignerNode1:Container": "SplitPanelNode2:panel#FirstContainer",
      "NodeEditorNode1:Container": "SplitPanelNode2:panel#SecondContainer",
      "NodeTreeNode1:Container": "SplitPanelNode4:panel#SecondContainer"
    }
  }
};