/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const DetectRaisedHandNode = {
  $meta: {
    id: 'DetectRaisedHandNode',
    displayName: 'Detect Raised Hands',
    description: 'Look for raised hands in Mediapipe Pose Detection results.',
    category: 'Mediapipe',
  },
  $stores: {
    pose: {
      $type: 'PoseData',
      connection: true,
      noinspect: true
    },
    raisedHands: {
      $type: 'RaisedHands'
    }
  },
  DetectRaisedHand: {
    $kind: 'Fx/DetectRaisedHand',
    $inputs: ['pose'],
    $outputs: ['raisedHands']
  }
};
