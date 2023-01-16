/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const graph = {
  "$meta": {
    "name": "actual-ambition",
    "id": "1974-5824-6577"
  },
  "nodes": {
    "FlyoutNode1": {
      "id": "FlyoutNode1",
      "type": "FlyoutNode",
      "displayName": "Flyout",
      "connections": {
        "show": [
          "BooleanFieldNode1:value"
        ]
      },
      "props": {
        "show": false
      }
    },
    "ImageNode1": {
      "id": "ImageNode1",
      "type": "ImageNode",
      "displayName": "Image",
      "connections": {}
    },
    "BooleanFieldNode1": {
      "id": "BooleanFieldNode1",
      "type": "BooleanFieldNode",
      "displayName": "Boolean Field",
      "connections": {},
      "props": {
        "label": "Show Flyout",
        "value": false
      }
    }
  },
  "layout": {
    "preview": {
      "FlyoutNode1": {
        "l": 16,
        "t": 0,
        "w": 744,
        "h": 384
      },
      "ImageNode1": {
        "l": 160,
        "t": 112,
        "w": 240,
        "h": 184
      },
      "ImageNode1:Container": "FlyoutNode1:panel#flyout",
      "BooleanFieldNode1": {
        "l": 576,
        "t": 0,
        "w": 200,
        "h": 40
      }
    },
    "nodegraph": {
      "ImageNode1": {
        "l": 352,
        "t": 168,
        "w": 144,
        "h": 64
      },
      "BooleanFieldNode1": {
        "l": 104,
        "t": 48,
        "w": 144,
        "h": 120
      },
      "FlyoutNode1": {
        "l": 360,
        "t": 64,
        "w": 144,
        "h": 64
      }
    }
  }
};