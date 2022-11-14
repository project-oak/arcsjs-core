/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const GraphRunnerNode = {
  $meta: {
    id: 'GraphRunnerNode',
    category: 'Ai'
  },
  $stores: {
    graph: {
      $type: 'Pojo',
      connection: true
    }
  },
  graphRunner: {
    $kind: 'Graphs/GraphRunner',
    $inputs: ['graph']
  }
};
