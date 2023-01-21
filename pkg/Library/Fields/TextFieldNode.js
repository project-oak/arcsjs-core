/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const TextFieldNode = {
  $meta: {
    id: 'TextFieldNode',
    displayName: 'Text Field',
    category: 'Fields'
  },
  $stores: {
    flex: {
      $type: 'Boolean',
      $value: true
    },
    label: {
      $type: 'String',
      $value: 'text field'
    },
    value: {
      $type: 'String',
      $value: 'value'
    }
  },
  field: {
    $kind: '$library/Fields/TextField',
    $inputs: ['label', 'value', 'flex'],
    $outputs: ['label', 'value']
  }
};