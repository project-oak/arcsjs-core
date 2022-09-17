/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const HolisticRecipe = {
  $meta: {
    description: 'Mediapipe Holistic',
    name: 'Holistic',
    group: 'model'
  },
  $stores: {
    image: {
      $type: 'Image'
    },
    output: {
      $type: 'Pojo'
    }
  },
  Holistic: {
    $kind: 'Mediapipe/Holistic',
    $inputs: ['image'],
    $outputs: ['output']
  }
};
