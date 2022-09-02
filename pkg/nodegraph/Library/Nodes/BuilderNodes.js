/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {NodeCatalogRecipe} from '../../../Library/NodeCatalog/NodeCatalogRecipe.js';

export const Container = {
  $meta: {
    name: 'Container',
    category: 'Panels'
  },
  nodeContainer: {
    $kind: '$app/Library/Container'
  }
};

export const NodeCatalog = {
  ...NodeCatalogRecipe,
  $meta: {
    name: 'Node Catalog',
    category: 'Panels'
  }
  // $stores: {
  //   nodeTypes: {
  //     $type: '[JSON]',
  //     $value: Object.values(candyNodes),
  //     noinspect: true
  //   },
  // },
  // nodeCatalog: {
  //   $kind: '$library/NodeCatalog/NodeCatalog',
  //   $inputs: ['nodeTypes']
  // }
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