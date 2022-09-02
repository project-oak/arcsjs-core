/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {NodeCatalogRecipe} from '../../../Library/NodeCatalog/NodeCatalogRecipe.js';

export const isPoisonous = {
  $meta: {
    name: 'Is Poisonous',
    category: 'Panels'
  },
  $stores: {
    entityInfo: {
      $type: 'EntityInfo',
      $value: {
        name: 'Poison Ivy'
      }
    },
    isPoisonous: {
      $type: 'Boolean',
      noinspect: true
    }
  },
  nodeContainer: {
    $kind: '$library/Goog/isPoisonous',
    $inputs: ['entityInfo'],
    $outputs: ['isPoisonous']
  }
};

export const Haiku = {
  $meta: {
    name: 'Haiku',
    category: 'Panels'
  },
  nodeContainer: {
    $kind: '$library/Goog/HaikuWriter'
  }
};

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