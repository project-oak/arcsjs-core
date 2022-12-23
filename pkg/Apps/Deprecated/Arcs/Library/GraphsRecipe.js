/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export const GraphsRecipe = {
  $meta: {
    description: 'Arcs Graphs Recipe'
  },
  $stores: {
    graph: {
      $type: 'Pojo'
    }
  },
  main: {
    $kind: '$app/Library/Graphs'
  },
  // graphRunner: {
  //   $kind: '$app/Library/GraphRunner',
  //   $inputs: ['graph'],
  //   $outputs: ['result']
  // }
};