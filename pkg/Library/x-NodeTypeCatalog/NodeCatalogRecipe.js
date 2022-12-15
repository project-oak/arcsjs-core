/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const NodeCatalogRecipe = {
  $stores: {
    nodeSearch: {
      $type: 'String',
    },
    hoveredNodeType: {
      $type: 'Pojo',
      noinspect: true
    },
    nodeTypes: {
      $type: 'Pojo'
    },
    categories: {
      $type: 'Pojo',
      noinspect: true
    },
    selectedGraph: {
      $type: 'Pojo'
    }
  },
  NodeCatalog: {
    $kind:'$library/NodeTypeCatalog/NodeCatalog',
    $slots: {
      nodeSearch: {
        SearchBar: {
          $kind: '$library/NodeTypeCatalog/SearchBar',
          $inputs: [{'search': 'nodeSearch'}],
          $outputs: [{'search': 'nodeSearch'}]
        }
      },
      nodeList: {
        NodeList: {
          $kind: '$library/NodeTypeCatalog/NodeList',
          $inputs: [
            'nodeTypes',
            'categories',
            {graph: 'selectedGraph'},
            {'search': 'nodeSearch'},
            'newNodeInfos'
          ],
          $outputs: [
            {graph: 'selectedGraph'},
            'hoveredNodeType',
            'newNodeInfos'
          ],
          $slots: {
            typeInfo: {
              infoPanel: {
                $kind: '$library/NodeTypeCatalog/NodeTypeInfoPanel',
                $inputs: [
                  {nodeType: 'hoveredNodeType'},
                  'categories'
                ]
              }
            }
          }
        }
      }
    }
  }
};
