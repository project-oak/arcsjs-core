/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const GraphRunnerNode = {
  $meta: {
    id: 'GraphRunnerNode',
    displayName: 'Graph Runner',
    category: 'AI'
  },
  $stores: {
    live: {
      $type: 'Boolean'
    },
    enabled: {
      $type: 'Pojo',
      connection: true
    },
    graph: {
      $type: 'Pojo',
      connection: true
    }
  },
  graphRunner: {
    $kind: 'Graphs/GraphRunner',
    $inputs: ['enabled', 'live', 'graph']
  }
};
