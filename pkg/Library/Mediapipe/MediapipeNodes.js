/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const Holistic = {
  $meta: {
    description: 'Mediapipe Holistic',
    name: 'Holistic',
    category: 'Model'
  },
  $stores: {
    image: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true,
      connection: true
    },
    outputImage: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    },
    data: {
      $type: 'HolisticData',
      nomonitor: true,
      noinspect: true
    }
  },
  holistic: {
    $kind: 'Mediapipe/Holistic',
    $inputs: ['image'],
    $outputs: ['data']
  }
};

export const HolisticFace = {
  $meta: {
    description: 'Mediapipe Holistic Face',
    name: 'Holistic Face',
    category: 'Effect'
  },
  $stores: {
    data: {
      $type: 'HolisticData',
      nomonitor: true,
      noinspect: true,
      connection: true
    },
    outputImage: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    }
  },
  Holistic: {
    $kind: 'Mediapipe/HolisticFace',
    $inputs: ['data'],
    $outputs: ['outputImage']
  }
};

export const HolisticSticker = {
  $meta: {
    description: 'Mediapipe Holistic Sticker',
    name: 'Holistic Sticker',
    category: 'Effect'
  },
  $stores: {
    data: {
      $type: 'HolisticData',
      nomonitor: true,
      noinspect: true,
      connection: true
    },
    index: {
      $type: 'Number',
      range: {min: 0, max: 468, step: 1}
    },
    outputImage: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    },
    sticker: {
      $type: 'Image',
      connection: true
    }
  },
  Holistic: {
    $kind: 'Mediapipe/HolisticSticker',
    $inputs: ['data', 'sticker', 'index'],
    $outputs: ['outputImage']
  }
};
