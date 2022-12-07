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
  if (!state.tasked) {
    if (typeof graph === 'string') {
      graph = JSON.parse(graph);
    }
    if (this.graphChanged(graph, state.graph)) {
      state.graph = graph;
      await timeout(async () => {
        state.recipes = await state.builder(graph);
        //log(recipes);
      }, 500);
      return {recipes: state.recipes};
    }
  }
},
graphChanged(graph, oldGraph) {
  return graph.$meta.id !== oldGraph?.$meta?.id || this.nodesChanged(graph, oldGraph);
},
nodesChanged({nodes}, oldGraph) {
  const oldNodes = oldGraph?.nodes;
  if (keys(nodes).length === keys(oldNodes).length) {
    return !keys(oldNodes).every(key => deepEqual(oldNodes[key], nodes[key]));
  }
  return true;
},
});
