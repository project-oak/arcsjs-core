/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export const DevToolsNode = {
  $stores: {
    graphs: {
      $type: '[Pojo]',
      $tags: ['persisted'],
      $value: []
    }
  },
  devTools: {
    $kind: "$library/DevTools/DevTools",
    $inputs: ['graphs']
  }
};

export const DevToolsGraph = {
  $meta: {
    id: 'dev-tools',
    name: 'dev-tools'
  },
  nodes: [{
    type: 'DevToolsNode'
  }]
};
