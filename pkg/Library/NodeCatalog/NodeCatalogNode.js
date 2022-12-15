/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
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
  $stores: {
    nodeTypes: {
      $type: 'Pojo',
      noinspect: true
    },
    categories: {
      $type: 'Pojo',
      noinspect: true
    },
    newNodeInfos: {
      $type: '[Pojo]'
    },
    selectedGraph: {
      $type: 'Pojo'
    },
    hoveredNodeType: {
      $type: 'Pojo',
      noinspect: true
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
