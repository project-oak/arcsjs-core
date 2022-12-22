/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const graph = 
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
      },
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
      "NodeCatalogNode1:Container": "SplitPanelNode1:panel#topLeft",
      "SplitPanelNode2:Container": "SplitPanelNode1:panel#bottomRight",
      "SplitPanelNode3:Container": "SplitPanelNode2:panel#bottomRight",
      "NodeInspectorNode1:Container": "SplitPanelNode3:panel#topLeft"
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