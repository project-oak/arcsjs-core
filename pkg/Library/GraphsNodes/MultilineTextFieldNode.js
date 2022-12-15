/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const MultilineTextFieldNode = {
  $meta: {
    id: 'MultilineTextFieldNode',
    displayName: 'Multiline Text Field',
    category: 'Fields'
  },
  $stores: {
    label: {
      $type: 'String',
      $value: 'text field'
    },
    value: {
      $type: 'String',
      $value: 'value'
    },
    connectedValue: {
      $type: 'String',
      connection: true
    },
    outputValue: {
      $type: 'String',
      $value: ''
    }
  },
  field: {
    $kind: '$library/Fields/MultilineTextField',
    $inputs: ['label', 'value', 'connectedValue'],
    $outputs: ['label', {value: 'outputValue'}]
  }
};