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
};
