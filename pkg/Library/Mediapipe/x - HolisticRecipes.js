/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const HolisticRecipe = {
  $meta: {
    description: 'Mediapipe Holistic',
    name: 'Holistic',
    category: 'Model'
  },
  $stores: {
    image: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    },
    output: {
      $type: 'Pojo',
      nomonitor: true
    }
  },
  Holistic: {
    $kind: 'Mediapipe/Holistic',
    $inputs: ['image'],
    $outputs: ['output']
  }
};

export const HolisticSticker = {
  $meta: {
    description: 'MpHolistic Sticker',
    name: 'Holistic Sticker',
    category: 'Effect'
  },
  $stores: {
    image: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    },
    index: {
      $type: 'Number'
    }
  },
  Holistic: {
    $kind: 'Mediapipe/HolisticSticker',
    $inputs: ['frame', 'index']
  }
};
