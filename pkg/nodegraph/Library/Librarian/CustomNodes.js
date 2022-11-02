/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const Librarian = {
  $meta: {
    id: 'librarian',
    category: 'Custom'
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
  customParticle: {
    $kind: '$app/Library/Librarian/CustomParticle',
    $inputs: [
      'nodeId',
      {'graph': 'selectedGraph'}
    ],
    $outputs: [
      {'graph': 'selectedGraph'}
    ]
  }
};
