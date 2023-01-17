/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const ImageNode = {
  $meta: {
    id: 'ImageNode',
    displayName: 'Image',
    category: 'Media'
  },
  $stores: {
    image: {
      $type: 'Image',
      $value: {
        url: 'https://storage.googleapis.com/tfweb/testpics/strawberry2.jpeg',
      }
    }
  },
  image: {
    $kind: '$library/Media/Image',
    $inputs: ['image'],
    $outputs: ['image']
  }
};