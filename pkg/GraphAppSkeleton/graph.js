/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const graph = {
  $meta: {
    name: "querulous-statement",
    id: "2742-8541-3678"
  },
  nodes: {
    Camera: {
      id: "CameraNode1",
      type: "CameraNode",
      displayName: "Camera"
    },
    PoseDetector: {
      id: "PoseNode1",
      type: "PoseNode",
      displayName: "Pose Detection",
      connections: {
        image: ["CameraNode1:frame"]
      }
    },
    PoseDetector: {
      id: "PoseNode1",
      type: "PoseNode",
      displayName: "Pose Detection",
      connections: {
        image: ["CameraNode1:frame"]
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
      }
    },
    DisplayNode1: {
      id: "DisplayNode1",
      type: "DisplayNode",
      connections: {
        value: ["PoseNode1:pose"]
      }
    }
  },
  // layout: {
  //   previewLayout:  {
  //     "CameraNode1:Container": "main#root",
  //     "DisplayNode1:Container": "main#root"
  //   }
  // }
};