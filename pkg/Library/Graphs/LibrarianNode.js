/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const LibrarianNode = {
  $meta: {
    id: 'LibrarianNode',
    category: 'Ai'
  },
  $stores: {
    nodeId: {
      $type: 'String',
      noinspect: true,
      nodisplay: true,
      value: 'node.id'
    },
    selectedGraph: {
      $type: 'JSON',
      connection: true,
      noinspect: true,
      nodisplay: true
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
