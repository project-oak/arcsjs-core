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
    name: 'Is Poisonous',
    category: 'Panels'
  },
  $stores: {
    entityInfo: {
      $type: 'EntityInfo',
      $value: {
        name: 'Poison Ivy'
      }
    },
    isPoisonous: {
      $type: 'Boolean',
      noinspect: true
    }
  },
  isPoisonous: {
    $kind: '$library/Goog/isPoisonous',
    $inputs: ['entityInfo'],
    $outputs: ['isPoisonous']
  }
};
