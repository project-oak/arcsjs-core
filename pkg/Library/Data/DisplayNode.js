/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const DisplayNode = {
  $meta: {
    id: 'DisplayNode',
    displayName: 'Display',
    category: 'Data'
  },
  $stores: {
    text: {
      $type: 'Pojo'
    },
    textStyle: {
      $type: 'CssStyle',
      value: 'padding: 8px;'
    }
  },
  text: {
    $kind: '$library/Data/Display',
    $inputs: ['text', 'textStyle']
  }
};
