/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const LineObjectNode = {
  $meta: {
    id: 'LineObjectNode',
    displayName: 'Line',
    category: 'Fields',
  },
  $stores: {
    lineStyle: {
      $type: 'String'
    }
  },
  field: {
    $kind: '$library/Fields/LineObject',
    $inputs: ['lineStyle']
  }
};
