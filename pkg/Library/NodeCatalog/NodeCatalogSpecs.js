/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const NodeCatalogStores = {
  selectedNodeTypes: {
    $type: '[JSON]',
  },
  nodeSearch: {
    $type: 'String',
  },
  hoveredNodeType: {
    $type: 'JSON'
  },
  categories: {
    $type: 'JSON'
  }
};

export const NodeCatalogParticles = {
  NodeCatalog: {
    $kind:'$library/NodeCatalog/NodeCatalog',
    $slots: {
      nodeSearch: {
        SearchBar: {
          $kind: '$library/NodeCatalog/SearchBar',
          $inputs: [{'search': 'nodeSearch'}],
          $outputs: [{'search': 'nodeSearch'}]
        }
      },
      categories: {
        CategoryCatalog: {
          $kind: '$library/NodeCatalog/CategoryCatalog',
          $inputs: [
            'nodeTypes',
            'categories',
            {'search': 'nodeSearch'}
          ],
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
  },
};
