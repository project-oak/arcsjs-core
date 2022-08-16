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
  hoverEvent: {
    $type: 'JSON'
  }
};

export const NodeCatalogParticles = {
  NodeCatalog: {
    $kind:'$library/FlowGraph/NodeCatalog/NodeCatalog',
    $slots: {
      nodeSearch: {
        SearchBar: {
          $kind: '$library/FlowGraph/NodeCatalog/SearchBar',
          $inputs: [{'search': 'nodeSearch'}],
          $outputs: [{'search': 'nodeSearch'}]
        }
      },
      categories: {
        CategoryCatalog: {
          $kind: '$library/FlowGraph/NodeCatalog/CategoryCatalog',
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
          $kind: '$library/FlowGraph/NodeCatalog/NodeList',
          $inputs: [
            'selectedNodeTypes',
            {pipeline: 'selectedPipeline'}
          ],
          $outputs: [
            {pipeline: 'selectedPipeline'},
            'hoverEvent'
          ],
          $slots: {
            typeInfo: {
              infoPanel: {
                $kind: '$library/FlowGraph/NodeCatalog/NodeTypeInfoPanel',
                $inputs: ['hoverEvent']
              }
            }
          }
        }
      }
    }
  },
};
