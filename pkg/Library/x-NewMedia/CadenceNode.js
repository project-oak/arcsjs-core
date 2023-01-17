/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const ImageCadenceNode = {
  $meta: {
    id: 'ImageCadence',
    category: 'Media'
  },
  $stores: {
    image: {
      $type: 'Image',
    },
    frame: {
      $type: 'Image',
    }
  },
  field: {
    $kind: '$library/Media/Image',
    $inputs: ['image'],
    $outputs: ['image']
  }
};