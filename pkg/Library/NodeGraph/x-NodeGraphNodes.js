/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {NodeCatalogRecipe} from '../NodeTypeCatalog/NodeCatalogRecipe.js';

export const NodeCatalog = {
  ...NodeCatalogRecipe,
  $meta: {
    id: 'Node Catalog',
    category: 'Panels'
  }
};

export const ObjectInspector = {
  $meta: {
    id: 'Object Inspector',
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