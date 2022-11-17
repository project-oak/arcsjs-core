/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const RecipeBuilderNode = {
  $meta: {
    id: 'RecipeBuilderNode',
    displayName: 'Recipe Builder',
    category: 'AI'
  },
  $stores: {
    graph: {
      $type: 'Pojo',
      connection: true
    },
    recipes: {
      $type: 'Pojo',
      noinspect: true
    }
  },
  OpenAiGpt3: {
    $kind: '$library/RecipeBuilder/RecipeBuilderParticle',
    $inputs: ['graph'],
    $outputs: ['recipes']
  }
};