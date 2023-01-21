/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {nodeTypes} from './nodeTypes.js';
import {Resources} from '../App/Resources.js';

export const NodeTypesNode = {
  $meta: {
    id: 'NodeTypesNode',
    displayName: 'Node Types',
    category: 'Designer'
  },
  $stores: {
    nodeTypes: {
      $type: 'Pojo',
      noinspect: true
    }
  },
  NodeTypes: {
    $kind: '$library/Node/NodeTypesParticle',
    $staticInputs: {
      nodeTypesResource: Resources.allocate(nodeTypes)
    },
    $outputs: ['nodeTypes']
  }
};

nodeTypes.NodeTypesNode = NodeTypesNode;