/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const IllustratorNode = {
  $meta: {
    id: 'IllustratorNode',
    displayName: 'Illustrator',
    category: 'Demo Book'
  },
  $stores: {
    pages: {
      $type: '[Page]',
      connection: true
    },
    illustratedPages: {
      $type: '[Page]',
      noinspect: true
    }
  },
  Illustrator: {
    $kind: '$labs/Demo/Illustrator',
    $inputs: ['pages'],
    $outputs: ['illustratedPages']
  }
};
