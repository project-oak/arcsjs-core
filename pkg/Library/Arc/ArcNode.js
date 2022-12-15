/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const ArcNode = {
  $meta: {
    id: 'ArcNode',
    displayName: 'Arc',
    category: 'Panels'
  },
  $stores: {
    arcName: {
      $type: 'String',
      $value: ''
    },
    graphName: {
      $type: 'Graph',
      $value: null,
    }
  },
  arc: {
    $kind: '$library/App/ArcParticle',
    $inputs: ['arcName', 'graphName']
  }
};
