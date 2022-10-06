/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
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
      $type: 'MultilineText'
    },
    result: {
      $type: 'String',
      //noinspect: true
    }
  },
  holistic: {
    $kind: 'JSONata/JSONata',
    $inputs: ['json', 'expression'],
    $outputs: ['result']
  }
};
