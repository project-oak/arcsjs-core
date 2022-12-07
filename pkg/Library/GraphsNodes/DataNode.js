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
    connectedData: {
      $type: 'Pojo',
      connection: true
    },
    data: {
      $type: 'Pojo'
    },
    outputData: {
      $type: 'Pojo'
    }
  },
  text: {
    $kind: '$library/Graphs/DataNode',
    $inputs: ['data', 'connectedData'],
    $outputs: [{data: 'outputData'}]
  }
};

export const PersistedDataNode = {
  $meta: {
    id: 'DataNode',
    displayName: 'Data (Persisted)',
    category: 'Fields'
  },
  $stores: {
    connectedData: {
      $type: 'Pojo',
      connection: true
    },
    data: {
      $type: 'Pojo',
      $tags: ['persisted']
    }
  },
  text: {
    $kind: '$library/Graphs/DataNode',
    $inputs: ['data'],
    $outputs: ['data']
  }
}