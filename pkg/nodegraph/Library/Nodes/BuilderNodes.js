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
  isPoisonous: {
    $kind: '$library/Goog/isPoisonous',
    $inputs: ['entityInfo'],
    $outputs: ['isPoisonous']
  }
};

export const Poem = {
  $meta: {
    name: 'Poem',
    category: 'Panels'
  },
  poem: {
    $kind: '$library/Goog/PoemWriter'
  }
};

export const GoogleMap = {
  $meta: {
    name: 'Google Maps',
    category: 'Panels'
  },
  $stores: {
    geolocation: {
      $type: 'Geolocation',
      $value: {
        latitude: 38.1904808,
        longitude: -122.2901155
      }
    }
  },
  locator: {
    $kind: '$library/Geolocation/Geolocation',
    $outputs: ['geolocation']
  },
  map: {
    $kind: '$library/Goog/GoogleMap',
    $inputs: ['geolocation']
  }
};

export const Container = {
  $meta: {
    name: 'Container',
    category: 'Panels'
  },
  $stores: {
    layout: {
      $type: 'String',
      $value: 'column'
    }
  },
  container: {
    $kind: '$app/Library/Container',
    $inputs: ['layout'],
    $slots: {
      content: {}
    }
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