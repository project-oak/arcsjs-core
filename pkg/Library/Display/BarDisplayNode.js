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
    category: 'Output'
  },
  $stores: {
    ClassifierResults: {
      $type: 'Pojo',
      connection: true,
      noinspect: true
    },
  },
  jsonDisplay: {
    $kind: '$library/Display/BarDisplay',
    $inputs: [
      {classifierResults: 'ClassifierResults'}
    ]
  }
};