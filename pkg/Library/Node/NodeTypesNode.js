/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {nodeTypes} from './nodeTypes.js';

export const NodeTypesNode = {
  $meta: {
    id: 'NodeTypesNode',
    displayName: 'Node Types',
    category: 'Designer'
  },
  $stores: {
    NodeTypes: {
      $type: 'Pojo',
      $value: {...nodeTypes},
      noinspect: true
    }
  },
  NodeTypes: {
    $kind: '$library/NoOp',
    $outputs: ['NodeTypes']
  }
};