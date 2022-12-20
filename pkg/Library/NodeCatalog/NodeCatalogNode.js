/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
const typeInfo = {
  NodeTypeInfoPanel: {
    $stores: {
      categories: {
        $type: 'Pojo',
        noinspect: true
      },
      hoveredNodeType: {
        $type: 'Pojo',
        noinspect: true
      }
    },
    $kind: '$library/NodeCatalog/NodeTypeInfoPanel',
    $inputs: [
      {nodeType: 'hoveredNodeType'},
      'categories'
    ]
  }
};

const nodeList = {
  // NOTE: these stores are connected to _globalStores_, hence should not be
  // inspected - atm Node Inspector doesn't support global stores.
  $stores: {
    nodeTypes: {
      $type: 'Pojo',
      noinspect: true,
      nodisplay: true
    },
    categories: {
      $type: 'Pojo',
      noinspect: true,
      nodisplay: true
    },
    newNodeInfos: {
      $type: '[Pojo]',
      nodisplay: true
    },
    selectedGraph: {
      $type: 'Pojo',
      nodisplay: true
    },
    hoveredNodeType: {
      $type: 'Pojo',
      noinspect: true,
      nodisplay: true
    }
  },
  NodeList: {
    $kind: '$library/NodeCatalog/NodeList',
    $inputs: [
      'nodeTypes', 'categories', 'newNodeInfos',
      {graph: 'selectedGraph'},
      {search: 'nodeSearch'}
    ],
    $outputs: [
      {graph: 'selectedGraph'},
      'hoveredNodeType',  'newNodeInfos'
    ],
    $slots: {
      typeInfo
    }
  }
};

const nodeSearch = {
  $stores: {
    nodeSearch: {
      $type: 'String',
    }
  },
  SearchBar: {
    $kind: '$library/NodeCatalog/SearchBar',
    $inputs: [{'search': 'nodeSearch'}],
    $outputs: [{'search': 'nodeSearch'}]
  }
};

export const NodeCatalogNode = {
  $meta: {
    id: 'NodeCatalogNode',
    displayName: 'Node Catalog',
    category: 'Panels'
  },
  NodeCatalog: {
    $kind:'$library/NodeCatalog/NodeCatalog',
    $slots: {
      nodeSearch,
      nodeList
    }
  }
};
