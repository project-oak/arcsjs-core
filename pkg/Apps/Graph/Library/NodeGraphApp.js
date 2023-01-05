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
    this.recipes = [NodegraphRecipe];
    log('Welcome!');
  }
  async onservice(user, host, request) {
    switch (request?.msg) {
      case 'RemoveGraph':
        await this.removeGraph(request.data.graph);
        return true;
      case 'AddGraph':
        await this.addGraph(request.data.graph);
        return true;
      default: break;
    }
  }
  async removeGraph(graph) {
    this.arcs.removeGraph('user', graph, this.nodeTypes);
  }
  async addGraph(graph) {
    if (this.lastGraph) {
      await this.removeGraph(this.lastGraph);
      this.lastGraph = null;
    }
    await this.arcs.addGraph('user', graph, this.layoutId, this.nodeTypes);
  }
};
