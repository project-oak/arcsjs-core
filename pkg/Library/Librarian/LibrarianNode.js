/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const LibrarianNode = {
  $meta: {
    id: 'LibrarianNode',
    displayName: 'Librarian',
    category: 'Designer'
  },
  $stores: {
    nodeId: {
      $type: 'String',
      noinspect: true,
      value: 'node.id'
    },
    selectedGraph: {
      $type: 'JSON',
      noinspect: true
    },
  },
  librarian: {
    $kind: '$library/Graphs/Librarian',
    $inputs: [
      'nodeId',
      {'graph': 'selectedGraph'}
    ],
    $outputs: [
      {'graph': 'selectedGraph'}
    ]
  }
};
