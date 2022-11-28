/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const PixabayNode = {
  $meta: {
    id: 'PixabayNode',
    displayName: 'Pixabay Image Search',
    category: 'Media'
  },
  $stores: {
    connectedQuery: {
      $type: 'String',
      connection: true
    },
    query: {
      $type: 'String'
    },
    image: {
      $type: 'Image',
      noinspect: true
    }
  },
  pixabay: {
    $kind: '$library/Pixabay/Pixabay',
    $inputs: ['query'],
    $outputs: ['image']
  }
};