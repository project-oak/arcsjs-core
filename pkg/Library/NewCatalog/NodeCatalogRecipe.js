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
    // selectedNodeTypes: {
    //   $type: 'JSON',
    //   noinspect: true
    // },
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
    $kind:'$library/NewCatalog/NodeCatalog',
    $slots: {
      nodeSearch: {
        SearchBar: {
          $kind: '$library/NewCatalog/SearchBar',
          $inputs: [{'search': 'nodeSearch'}],
          $outputs: [{'search': 'nodeSearch'}]
        }
      },
      // categories: {
      //   CategoryCatalog: {
      //     $kind: '$library/NewCatalog/CategoryCatalog',
      //     $inputs: ['nodeTypes', 'categories', {'search': 'nodeSearch'}],
      //     $outputs: ['selectedNodeTypes']
      //   }
      // },
      nodetypes: {
        NodeList: {
          $kind: '$library/NewCatalog/NodeList',
          $inputs: [
            // 'selectedNodeTypes',
            'nodeTypes',
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
                $kind: '$library/NewCatalog/NodeTypeInfoPanel',
                $inputs: [{nodeType: 'hoveredNodeType'}]
              }
            }
          }
        }
      }
    }
  }
};
