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
    selectedNodeTypes: {
      $type: '[JSON]',
      noinspect: true
    },
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
    $kind:'$library/NodeCatalog/NodeCatalog',
    $slots: {
      nodeSearch: {
        // SearchBar: {
        //   $kind: '$library/NodeCatalog/SearchBar',
        //   $inputs: [{'search': 'nodeSearch'}],
        //   $outputs: [{'search': 'nodeSearch'}]
        // }
      },
      categories: {
        CategoryCatalog: {
          $kind: '$library/NodeCatalog/CategoryCatalog',
          $inputs: ['nodeTypes', 'categories', {'search': 'nodeSearch'}],
          $outputs: ['selectedNodeTypes']
        }
      },
      nodetypes: {
        NodeList: {
          $kind: '$library/NodeCatalog/NodeList',
          $inputs: [
            'selectedNodeTypes',
            {pipeline: 'selectedPipeline'}
          ],
          $outputs: [
            {pipeline: 'selectedPipeline'},
            'hoveredNodeType'
          ],
          $slots: {
            typeInfo: {
              infoPanel: {
                $kind: '$library/NodeCatalog/NodeTypeInfoPanel',
                $inputs: [{nodeType: 'hoveredNodeType'}]
              }
            }
          }
        }
      }
    }
  }
};
