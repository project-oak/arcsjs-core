/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const JSONataNode = {
  $meta: {
    id: 'JSONata',
    category: 'Tools'
  },
  $stores: {
    json: {
      $type: 'Pojo',
      connection: true
    },
    expression: {
      $type: 'MultilineText',
    },
    result: {
      $type: 'String',
      noinspect: true
    }
  },
  JSONata: {
    $kind: 'JSONata/JSONata',
    $inputs: ['json', 'expression'],
    $outputs: ['result']
  }
};
