/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory, App, RecipeBuilder} from '../arcs/arcs.js';
import {GraphRecipe} from './GraphRecipe.js';

export const GraphApp = class extends App {
  constructor(paths) {
    super(paths);
    this.recipes = [GraphRecipe];
  }
  async spinup() {
    await super.spinup();
    await this.addGraph(this.graph);
  }
  async onservice(user, host, request) {
    if (request?.msg === 'addRunnerGraph') {
      if (this.lastGraph) {
        await this.removeGraph(this.lastGraph);
      }
      this.lastGraph = request.data.graph;
      if (this.lastGraph) {
        await this.addGraph(this.lastGraph);
      }
    }
  }
  async removeGraph(graph) {
    const recipes = RecipeBuilder.construct({graph, nodeTypes: this.nodeTypes});
    this.arcs.removeRecipes('user', recipes);
  }
  async addGraph(graph) {
    if (this.lastRecipes) {
      await this.arcs.removeRecipes('user', this.lastRecipes);
      this.lastRecipes = null;
    }
    const layout = graph?.position?.previewLayout;
    const recipes = RecipeBuilder.construct({graph, layout, nodeTypes: this.nodeTypes});
    //
    // this.lastRecipes = recipes;
    // logGraphInfo(graph, recipes, nodeTypes);
    // //
    // if (!this.layout) {
    //   // first time
    //   this.lastRecipes = null;
    //   log(recipes);
    //   this.layout = layout;
    //   this.arcs.set('user', 'graphLayout', this.layout);
    // }
    //
    await this.arcs.addRecipes('user', recipes);
    //
    // TODO(sjmiles): MutationObserver only works 50% of the time :(
    // const fixLayout = () => {
    //   const dlayout = deepQuerySelector(document.body, 'designer-layout');
    //   if (!dlayout) {
    //     setTimeout(fixLayout, 100);
    //   } else {
    //     layout.kick = Math.random()
    //     setTimeout(() => layout.kick = Math.random(), 300);
    //   }
    // };
    // setTimeout(fixLayout, 100);
  }
};

// const logGraphInfo = (graph, recipes, nodeTypes) => {
//   log.groupCollapsed('addGraph');
//   log(graph);
//   log('constructed recipes:');
//     log.groupCollapsed('from nodeTypes:');
//     log.log(JSON.stringify(nodeTypes, null, '  '));
//     log.groupEnd();
//   log(JSON.stringify(recipes, null, '  '));
//   log.groupEnd();
// };