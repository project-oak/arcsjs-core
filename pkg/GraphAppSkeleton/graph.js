/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const graph = {
  "$meta": {
    "name": "glittering-sleep",
    "id": "1768-8545-2392"
  },
  "nodes": {
    "PoseNode1": {
      "id": "PoseNode1",
      "type": "PoseNode",
      "displayName": "Pose Detection",
      "connections": {
        "image": [
          "CameraNode1:frame"
        ]
      },
      "props": {}
    },
    "DisplayNode1": {
      "id": "DisplayNode1",
      "type": "DisplayNode",
      "displayName": "Display",
      "connections": {
        "text": [
          "DetectRaisedHandNode1:raisedHands"
        ]
      },
      "props": {
        "textStyle": "padding: 4px; background: white; font-size: 3em;"
      }
    },
    "CameraNode1": {
      "id": "CameraNode1",
      "type": "CameraNode",
      "displayName": "Camera",
      "connections": {},
      "props": {
        "frame": {},
        "fps": 10
      }
    },
    "DetectRaisedHandNode1": {
      "id": "DetectRaisedHandNode1",
      "type": "DetectRaisedHandNode",
      "displayName": "Detect Raised Hands",
      "connections": {
        "pose": [
          "PoseNode1:pose"
        ]
      },
      "props": {
        "raisedHands": true
      }
    }
  },
  "position": {
    "previewLayout": {
      "id": "7620-6595-1346",
      "ImageNode1": {
        "l": 48,
        "t": 88,
        "w": 240,
        "h": 184
      },
      "DisplayNode1": {
        "l": 336,
        "t": 136,
        "w": 232,
        "h": 112
      },
      "CameraNode1": {
        "l": 64,
        "t": 64,
        "w": 240,
        "h": 184
      }
    },
    "nodegraphLayout": {
      "id": "7620-6595-1346",
      "ImageNode1": null,
      "null": null,
      "PoseNode1": {
        "l": 248,
        "t": 48,
        "w": 144,
        "h": 80
      },
      "DisplayNode1": {
        "l": 376,
        "t": 264,
        "w": 144,
        "h": 80
      },
      "DetectRaisedHandNode1": {
        "l": 104,
        "t": 296,
        "w": 144,
        "h": 64
      }
    }
  },
  "layout": {
    "nodegraph": {
      "CameraNode1": {
        "l": 80,
        "t": 240,
        "w": 144,
        "h": 120
      },
      "PoseNode1": {
        "l": 336,
        "t": 248,
        "w": 144,
        "h": 64
      },
      "DetectRaisedHandNode1": {
        "l": 144,
        "t": 96,
        "w": 144,
        "h": 64
      },
      "DisplayNode1": {
        "l": 376,
        "t": 48,
        "w": 144,
        "h": 80
      }
    },
    "preview": {
      "CameraNode1": {
        "l": 16,
        "t": 16,
        "w": 360,
        "h": 360
      },
      "DisplayNode1": {
        "l": 400,
        "t": 160,
        "w": 232,
        "h": 112
      }
    }
  }
};