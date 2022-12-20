/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const BooleanFieldNode = {
  $meta: {
    id: 'BooleanFieldNode',
    displayName: 'Boolean Field',
    category: 'Fields'
  },
  $stores: {
    label: {
      $type: 'String',
      $value: 'boolean field'
    },
    value: {
      $type: 'Boolean'
    }
  },
  field: {
    $kind: '$library/Fields/BooleanField',
    $inputs: ['label', 'value'],
    $outputs: ['label', 'value']
  }
};
