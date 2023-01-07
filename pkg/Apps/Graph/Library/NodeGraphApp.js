/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
*/
import {logFactory, App, LocalStoragePersistor} from '../arcs.js';
import {nodeTypes, NodegraphRecipe} from './NodegraphRecipe.js';
import * as services from '../services.js';

const log = logFactory(true, 'Nodegraph', 'navy');

export const NodegraphApp = class extends App {
  constructor(paths) {
    super(paths);
    services.ArcService.nodeTypes = nodeTypes;
    // TODO(mariakleiner): use ArcService instead?
    this.layoutId ??= 'preview';
    this.nodeTypes = nodeTypes;
    // services.RecipeBuilderService.nodeTypes = nodeTypes;
    this.services = services;
    this.persistor = new LocalStoragePersistor('user');
    // this.recipes = [NodegraphRecipe];
    this.graph = {$meta: {id: 'nodegraph-app', name: 'nodegraph-app'}, nodes: [{type: 'NodegraphRecipe'}]};
    log('Welcome!');
  }
  async spinup() {
    await super.spinup();
    // TODO(mariakleiner): runGraph in App base class implementation!
    await this.arcs.runGraph('user', this.graph, this.layoutId, {NodegraphRecipe});
  }
  async onservice(user, host, request) {
    switch (request?.msg) {
      case 'RemoveGraph':
        await this.removeGraph(request.data.graph);
        return true;
      case 'RunGraph':
        await this.runGraph(request.data.graph);
        return true;
      default: break;
    }
  }
  async removeGraph(graph) {
    this.arcs.removeGraph('user', graph, this.nodeTypes);
  }
  async runGraph(graph) {
    if (this.lastGraph) {
      await this.removeGraph(this.lastGraph);
      this.lastGraph = null;
    }
    return this.arcs.runGraph('user', graph, this.layoutId, this.nodeTypes);
  }
};
