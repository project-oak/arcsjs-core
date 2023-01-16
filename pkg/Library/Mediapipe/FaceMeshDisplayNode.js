/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const FaceMeshDisplay = {
  $meta: {
    id: 'FaceMeshDisplay',
    displayName: 'Face Display',
    description: 'Face Display',
    category: 'Mediapipe'
  },
  $stores: {
    data: {
      $type: 'FaceData',
      nomonitor: true,
      noinspect: true
    },
    outputImage: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    }
  },
  FaceMeshDisplay: {
    $kind: 'Mediapipe/FaceMeshDisplay',
    $inputs: ['data'],
    $outputs: ['outputImage']
  }
};
