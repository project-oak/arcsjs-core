/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const DataNode = {
  $meta: {
    id: 'DataNode',
    displayName: 'Data',
    category: 'Fields'
  },
  $stores: {
    data: {
      $type: 'Pojo'
    }
  },
  text: {
    $kind: '$library/Graphs/DataNode',
    $inputs: [{'text': 'data'}],
    $outputs: ['data']
  }
};