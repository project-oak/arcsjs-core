/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../Core/core.js';
// import {RecipeBuilder} from '../RecipeBuilder/RecipeBuilder.js';

const log = logFactory(logFactory.flags.services || logFactory.flags.ArcService, 'ArcService', 'tomato');

export const ArcService = {
  // must be attached to the service by owner
  nodeTypes: {},
  layoutInfo: {},
  // TODO(marakleiner): refactor to not use RecipeBuilder!
  async addNamedGraph({arcName, graphName, defaultContainer}, arcs) {
    if (arcName && graphName) {
      log('addNamedGraph', arcName);
      // if (this.lastRecipes) {
      //   await arcs.removeRecipes(arc, this.lastRecipes);
      //   this.lastRecipes = null;
      // }
      //const container = `ArcNode1:arc#arc`;
      //onst graphs = runtime.stores.graphs.data || [];
      const graphs = await arcs.get('user', 'graphs');
      const graph = graphs.find(g => g?.$meta?.name === graphName); // ?? graphs?.[0];
      //
      if (graph) {
        arcs.runGraph(arcName, graph, this.nodeTypes, this.layoutInfo);
        /*
        RecipeBuilder.defaultContainer = defaultContainer;
        const recipes = RecipeBuilder.construct({graph, nodeTypes: this.nodeTypes});
        RecipeBuilder.defaultContainer = 'main#graph';
        await arcs.createArc(arcName);
        await arcs.addRecipes(arcName, recipes);
        arcs.set(arcName, 'graphLayout', graph.position?.previewLayout);
        */
      } else {
        log(`no graph named "${graphName}"`);
      }
    }
  },
  //
  // async addParticle({user, arc, meta, code}, arcs) {
  //   await arcs.createParticle(user, arc, meta, code);
  //   return true;
  // },
  // async destroyParticle({arc, name}, arcs) {
  //   await arcs.destroyParticle(name, arc);
  //   return true;
  // },
  // async updateParticle({arc, kind, code}, arcs) {
  //   await arcs.updateParticle(arc, kind, code);
  //   return true;
  // },
  //
  async runGraph({graph}, arcs) {
    //if (this.lastGraph) {
      //await this.removeGraph(this.lastGraph);
      //this.lastGraph = null;
    //}
    return arcs.runGraph('user', graph, this.nodeTypes, this.layoutInfo);
  },
  async removeGraph({graph}, arcs) {
    arcs.removeGraph('user', graph, this.nodeTypes);
  }
};
