/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {App} from '../Worker/App.js';
import {RecipeBuilder} from '../../RecipeBuilder/RecipeBuilder.js';

export const GraphApp = class extends App {
  async spinup() {
    this.layoutId ??= 'preview';
    this.recipes = this.configureRecipes(this.graph, this.layoutId);
    this.logInfo();
    await super.spinup();
    await this.addGraph(this.graph, this.layoutId);
  }
  configureRecipes(graph, layoutId) {
    // n.b. the GraphRecipe actually only wants the rectangles from the graph layouts
    const GraphRecipe = {
      main: {
        $kind: '$app/Library/Graph',
        $staticInputs: {graph, layoutId}
      }
    };
    return [GraphRecipe];
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
  async addGraph(graph, layoutId) {
    if (this.lastRecipes) {
      await this.arcs.removeRecipes('user', this.lastRecipes);
      this.lastRecipes = null;
    }
    RecipeBuilder.defaultContainer = 'main#root';
    // n.b. the RecipeBuilder wants the nodes and the containers from the layout,
    // but not the rectangles
    const recipes = RecipeBuilder.construct({graph, layoutId, nodeTypes: this.nodeTypes});
    await this.arcs.addRecipes('user', recipes);
  }
  logInfo() {
    this.log.groupCollapsed('Boot flavors');
    this.log('paths', this.paths);
    this.log('nodeTypes', this.nodeTypes);
    this.log('services', this.services);
    this.log.groupEnd();
  }
};
