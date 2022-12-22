/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const FaceMeshFace = {
  $meta: {
    id: 'FaceMeshFace',
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
  FaceMeshFace: {
    $kind: 'Mediapipe/FaceMeshFace',
    $inputs: ['data'],
    $outputs: ['outputImage']
  }
};
