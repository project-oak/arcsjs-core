/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const BarDisplayNode =  {
  $meta: {
    id: 'BarDisplayNode',
    displayName: 'Bar Display',
    category: 'Fields'
  },
  $stores: {
    results: {
      $type: 'Pojo',
      noinspect: true
    },
  },
  jsonDisplay: {
    $kind: '$library/Data/BarDisplay',
    $inputs: ['results']
  }
};