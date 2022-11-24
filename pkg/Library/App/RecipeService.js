/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Chef, ParticleCook, Parser, logFactory} from '../Core/core.js';
import {RecipeBuilder} from '../Graphs/RecipeBuilder.js';

const log = logFactory(logFactory.flags.services || logFactory.flags.RecipeService, 'RecipeService', 'tomato');

export const RecipeService = async (runtime, host, request) => {
  switch (request.msg) {
    case 'FinagleRecipe':
      return finagleRecipe(runtime, host, request.data);
    case 'UpdateConnections':
      return updateConnections(host, request.data);
    case 'ParseRecipe':
      return parseRecipe(request.data);
    // case 'AddGraph':
    //   return addGraph(runtime, host, request.data);
  }
};

const parseRecipe =  ({recipe}) => {
  const parser = new Parser(recipe);
  const {stores, particles, slots, meta} = parser;
  return {stores, particles, slots, meta};
};

const finagleRecipe = async (runtime, host, {recipe, value}) => {
  const task = value ? 'execute' : 'evacipate';
  return recipe && Chef[task](recipe, runtime, host.arc);
};

const updateConnections = (host, {particleId, spec}) => {
  return host.arc.updateParticleMeta(particleId, ParticleCook.specToMeta(spec));
};

// const addGraph = async (runtime, host, {arcName, graphName}) => {
//   log('addGraph', arcName);
//   // if (this.lastRecipes) {
//   //   await this.arcs.removeRecipes(arc, this.lastRecipes);
//   //   this.lastRecipes = null;
//   // }
//   const container = `${host.id}#arc`;
//   const graphs = runtime.stores.graphs.data || [];
//   //const graphs = this.arcs.get('user', 'graphs');
//   const graph = graphs[graphName] ?? graphs?.[0];
//   if (!graph) {
//     return;
//   }
//   const recipes = RecipeBuilder.construct({graph, nodeTypes});
//   //this.lastRecipes = recipes;
//   //logGraphInfo(graph, recipes, nodeTypes);
//   //
//   // construct arc!
//   //
//   if (!this.layout) {
//     // first time
//     //this.lastRecipes = null;
//     this.layout = graph.position?.previewLayout;
//     this.arcs.set(arc, 'graphLayout', this.layout);
//   }
//   //
//   await this.arcs.createArc(arcName);
//   await this.arcs.addRecipes(arcName, recipes);
//   //
//   // // TODO(sjmiles): MutationObserver only works 50% of the time
//   // const fixLayout = () => {
//   //   const layout = deepQuerySelector(document.body, 'designer-layout');
//   //   if (!layout) {
//   //     setTimeout(fixLayout, 100);
//   //   } else {
//   //     layout.kick = Math.random()
//   //     setTimeout(() => layout.kick = Math.random(), 300);
//   //   }
//   // };
//   // //
//   // setTimeout(fixLayout, 100);
// };