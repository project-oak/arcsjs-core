/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
 export const RakshaNode = {
  $meta: {
    id: 'RakshaNode',
    displayName: 'Raksha Policy Enforcer',
    category: 'Policy'
  },
  $stores: {
    graph: {
      $type: 'Pojo',
      connection: true
    },
    verifiedGraph: {
      $type: 'Pojo'
    }
  },
  Raksha: {
    $kind: '$labs/Raksha/Raksha',
    $inputs: ['graph'],
    $outputs: ['verifiedGraph']
  }
};