/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

 export const MacroRunnerNode = {
  $meta: {
    id: 'Macro Runner',
    category: 'Panels'
  },
  $stores: {
    macroId: {
      $type: 'String',
    },
    nameKey: {
      $type: 'String',
    },
    params: {
      $type: 'String',
      connection: true
    },
    results: {
      $type: '[ClassifierResults]',
      noinspect: true
    }
  },
  macroRunner: {
    $kind: '$library/Goog/MacroRunner',
    $inputs: [
      'macroId',
      'nameKey',
      'params'
    ],
    $outputs: ['results']
  }
};
