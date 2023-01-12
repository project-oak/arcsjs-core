/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
*/
import {logFactory, App, LocalStoragePersistor} from '../arcs.js';
import {nodeTypes, nodegraphNodeTypes, NodegraphGraph} from './NodegraphRecipe.js';
import * as services from '../services.js';

const log = logFactory(true, 'Nodegraph', 'navy');

export const NodegraphApp = class extends App {
  constructor(paths) {
    super(paths);
    services.ArcService.nodeTypes = nodeTypes;
    services.ArcService.layoutInfo = {
      id: 'preview',
      defaultContainer: 'designer#graph'
    };
    this.services = services;
    this.persistor = new LocalStoragePersistor('user');
    this.nodeTypes = nodegraphNodeTypes;
    this.graphs = [NodegraphGraph];
    log('Welcome!');
  }
};
