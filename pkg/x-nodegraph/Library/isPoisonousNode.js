/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const isPoisonous = {
  $meta: {
    id: 'Is Poisonous',
    category: 'Panels'
  },
  $stores: {
    entityName: {
      $type: 'String',
      $value: {
        name: 'Poison Ivy'
      },
      connection: true
    },
    isPoisonous: {
      $type: 'Boolean',
      noinspect: true
    }
  },
  isPoisonous: {
    $kind: '$library/Goog/isPoisonous',
    $inputs: ['entityName'],
    $outputs: ['isPoisonous']
  }
};
