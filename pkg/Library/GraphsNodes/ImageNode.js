/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const ImageNode = {
  $meta: {
    id: 'ImageNode',
    category: 'Media'
  },
  $stores: {
    image: {
      $type: 'Image',
      $value: {
        url: 'https://storage.googleapis.com/tfweb/testpics/strawberry2.jpeg',
      }
    },
    connectedImage: {
      $type: 'Image',
      connection: true
    }
  },
  field: {
    $kind: '$library/NewMedia/Image',
    $inputs: ['connectedImage', 'image'],
    $outputs: ['image']
  }
};