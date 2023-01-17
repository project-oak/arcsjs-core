/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const globalStores = [
  'selectedNode',
  'selectedGraph',
  'nodeTypes',
  'categories',
  'nodeId',
];

export const RecipeBuilderRecipe = {
  candidateFinder: {
    $kind: '$library/RecipeBuilder/CandidateFinder',
    $inputs: [
      {graph: 'selectedGraph'},
      'nodeTypes'
    ],
    $staticInputs: {globalStores},
    $outputs: ['candidates']
  },
  connectionUpdater: {
    $kind: '$library/RecipeBuilder/ConnectionUpdater',
    $inputs: [
      {graph: 'selectedGraph'},
      'nodeTypes',
      'candidates',
    ],
    $outputs: [{graph: 'selectedGraph'}]
  }
  // recipeBuilder: {
  //   $kind: '$library/RecipeBuilder/RecipeBuilderParticle',
  //   $inputs: [
  //     'nodeTypes',
  //     {graph: 'selectedGraph'}
  //   ],
  //   $outputs: ['recipes']
  // }
};