/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const BinaryOpNode = {
  $meta: {
    id: 'Binary Op',
    displayName: 'BinaryOp',
    category: 'Ops'
  },
  $stores: {
    operator: {
      $type: 'String',
      values: ['add', 'subtract']
    },
    operand1: {
      $type: 'Number'
    },
    operand2: {
      $type: 'Number'
    },
    result: {
      $type: 'Number'
    }
  },
  BinaryOp: {
    $kind: '$library/Fields/BinaryOp',
    $inputs: ['operator', 'operand1', 'operand2'],
    $outputs: ['result']
  }
};