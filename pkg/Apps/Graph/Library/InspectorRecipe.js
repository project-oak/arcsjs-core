/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {customInspectors} from './customInspectors.js';

export const InspectorRecipe = {
  Inspector: {
    $kind: '$library/NodeInspector/ObjectInspector',
    $staticInputs: {customInspectors},
    $inputs: [{data: 'inspectorData'}],
    $outputs: [{data: 'inspectorData'}]
  },
  nodeInspector: {
    $kind: '$library/NodeInspector/NodeInspector',
    $staticInputs: {
      customInspectors,
      inspectorData: 'inspectorData',
    },
    $inputs: [
      'selectedNodeId',
      {graph: 'selectedGraph'},
      'candidates',
      'nodeTypes'
    ],
    $outputs: [{data: 'inspectorData'}]
  },
  nodeUpdater: {
    $kind: '$library/NodeInspector/NodeUpdater',
    $inputs: [
      'selectedNodeId',
      {graph: 'selectedGraph'},
      {data: 'inspectorData'},
      'nodeTypes'
    ],
    $outputs: [
      'selectedNodeId',
      {graph: 'selectedGraph'}
    ]
  }
};