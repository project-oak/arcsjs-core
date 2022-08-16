/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

 import * as candyNodes from './CandyNodes.js';

 export const Container = {
  $meta: {
    name: 'Container',
    category: 'Panels'
  },
  nodeContainer: {
    $kind: '$app/nodegraph/Library/Container'
  }
};

export const NodeCatalog = {
  $meta: {
    name: 'Node Catalog',
    category: 'Panels'
  },
  $stores: {
    nodeTypes: {
      $type: '[JSON]',
      $value: Object.values(candyNodes),
      noinspect: true
    },
  },
  nodeCatalog: {
    $kind: '$library/NodeCatalog/NodeCatalog',
    $inputs: ['nodeTypes']
  }
};

export const ObjectInspector = {
  $meta: {
    name: 'Object Inspector',
    category: 'Panels'
  },
  $stores: {
    inspectorData: {
      $type: 'JSON'
    }
  },
  inspector: {
    $kind: '$library/NodeGraph/Inspector',
    $inputs: [{data: 'inspectorData'}]
  }
};