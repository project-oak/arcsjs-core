/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const OpenAiImageNode = {
  $meta: {
    id: 'OpenAiImageNode',
    displayName: 'OpenAi Image',
    category: 'ML'
  },
  $stores: {
    prompt: {
      $type: 'Pojo'
    },
    rawImage: {
      $type: 'Image',
      nomonitor: true,
      noinspect: true
    },
    image: {
      $type: 'Image',
      nomonitor: true,
      noinspect: true
    }
  },
  OpenAiImage: {
    $kind: '$library/OpenAi/OpenAiImage',
    $inputs: ['prompt', 'image'],
    $outputs: [{image: 'rawImage'}]
  },
  Image: {
    $kind: '$library/NewMedia/Image',
    $inputs: [{'image': 'rawImage'}],
    $outputs: ['image']
  }
};
