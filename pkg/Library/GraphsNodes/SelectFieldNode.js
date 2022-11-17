/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const SelectFieldNode = {
  $meta: {
    id: 'SelectFieldNode',
    displayName: 'Select Field',
    category: 'Fields'
  },
  $stores: {
    label: {
      $type: 'String',
      $value: 'select one'
    },
    value: {
      $type: 'String',
      $value: ''
    },
    options: {
      $type: '[String]',
      $value: []
    }
  },
  field: {
    $kind: '$library/Fields/SelectField',
    $inputs: ['label', 'value', 'options'],
    $outputs: ['label', 'value']
  }
};