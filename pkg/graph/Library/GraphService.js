/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory, RecipeBuilder} from '../conf/arcs.js';
import {nodeTypes} from '../../Library/nodeTypes.js';

const log = logFactory(logFactory.flags.services || logFactory.flags.RecipeService, 'RecipeService', 'tomato');

export const GraphService = {
  async AddGraph({arcName, graphName, defaultContainer}, arcs) {
    if (arcName && graphName) {
      log('addGraph', arcName);
      // if (this.lastRecipes) {
      //   await arcs.removeRecipes(arc, this.lastRecipes);
      //   this.lastRecipes = null;
      // }
      //const container = `ArcNode1:arc#arc`;
      //onst graphs = runtime.stores.graphs.data || [];
      const graphs = await arcs.get('user', 'graphs');
      const graph = graphs.find(g => g?.$meta?.name === graphName); // ?? graphs?.[0];
      if (graph) {
        RecipeBuilder.defaultContainer = defaultContainer;
        const recipes = RecipeBuilder.construct({graph, nodeTypes});
        RecipeBuilder.defaultContainer = 'main#graph';
        await arcs.createArc(arcName);
        await arcs.addRecipes(arcName, recipes);
        arcs.set(arcName, 'graphLayout', graph.position?.previewLayout);
      } else {
        log(`no graph named "${graphName}"`);
      }
    }
  }
};