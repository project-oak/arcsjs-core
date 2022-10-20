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
      $type: 'JSON',
      noinspect: true
    },
    categories: {
      $type: 'JSON',
      noinspect: true
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
      nodetypes: {
        NodeList: {
          $kind: '$library/NodeTypeCatalog/NodeList',
          $inputs: [
            'nodeTypes',
            'categories',
            {pipeline: 'selectedPipeline'},
            {'search': 'nodeSearch'}
          ],
          $outputs: [
            {pipeline: 'selectedPipeline'},
            'hoveredNodeType'
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
