/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const DeviceImageNode = {
  $meta: {
    name: 'device image',
    category: 'output'
  },
  $stores: {
    image: {
      $type: 'Image',
      connection: true,
      nomonitor: true
    }
  },
  image: {
    $kind: '$app/Library/DeviceImage',
    $inputs: ['image']
  }
};
