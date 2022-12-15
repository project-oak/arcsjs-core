/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
*/
import {logFactory, App, LocalStoragePersistor} from '../arcs.js';
import * as services from '../services.js';
import {nodeTypes, NodegraphRecipe} from './NodegraphRecipe.js';

const log = logFactory(true, 'Nodegraph', 'navy');

export const NodegraphApp = class extends App {
  constructor(paths) {
    super(paths);
    services.ArcService.nodeTypes = nodeTypes;
    services.RecipeBuilderService.nodeTypes = nodeTypes;
    this.services = services;
    this.persistor = new LocalStoragePersistor('user');
    this.recipes = [NodegraphRecipe];
    log('Welcome!');
  }
  // // application service
  // async onservice(runtime, host, {msg, data}) {
  //   switch (msg) {
  //     case 'addParticle':
  //       return this.addParticle(runtime, host, data);
  //     case 'destroyParticle':
  //       return this.destroyParticle(runtime, host, data);
  //     case 'updateParticle':
  //       return this.updateParticle(runtime, host, data);
  //     case 'addGraph':
  //       return this.addGraph(data.graph);
  //   }
  // }
  // async addParticle(runtime, host, {name, meta, code}) {
  //   this.arcs.createParticle(name, 'user', meta, code);
  //   return true;
  // }
  // async destroyParticle(runtime, host, {name}) {
  //   this.arcs.destroyParticle(name, 'user');
  //   return true;
  // }
  // async updateParticle(runtime, host, {kind, code}) {
  //   this.arcs.updateParticle(kind, code, 'user');
  //   return true;
  // }
  // async addGraph(graph) {
  //   const recipes = RecipeBuilder.construct({graph, nodeTypes});
  //   loginate(nodeTypes, recipes);
  //   return this.arcs.addRecipes('user', recipes);
  // }
};

// const loginate = (nodeTypes, recipes) => {
//   log.groupCollapsed('constructed recipes:');
//     log.groupCollapsed('from nodeTypes:');
//       log.log(JSON.stringify(nodeTypes, null, '  '));
//     log.groupEnd();
//     log.log(JSON.stringify(recipes, null, '  '));
//   log.groupEnd();
// };