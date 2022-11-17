/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
initialize(inputs, state, {service}) {
  state.builder = graph => service({kind: 'RecipeBuilderService', msg: 'build', data: {graph}});
  state.finagle = (recipe, enable) => service({kind: 'RecipeService', msg: 'FinagleRecipe', data: {recipe, value: enable}});
},
shouldUpdate({graph}) {
  return graph;
},
async update({graph}, state) {
  const recipes = await state.builder(graph);
  log(recipes);
  // if (state.recipes?.length) {
  //   await Promise.all(state.recipes.map(r => state.finagle(r, false)));
  // }
  state.recipes = recipes;
  // if (recipes) {
  //   await Promise.all(recipes.map(r => state.finagle(r, true)));
  // }
  return {recipes};
}
});
