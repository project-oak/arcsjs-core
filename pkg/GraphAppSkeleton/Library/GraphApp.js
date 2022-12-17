/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {App, RecipeBuilder} from '../arcs/arcs.js';
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
    await this.arcs.addRecipes('user', recipes);
  }
};
