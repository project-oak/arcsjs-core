/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
*/
import {logFactory, App, LocalStoragePersistor} from '../arcs.js';
import {nodegraphNodeTypes, NodegraphGraph} from './NodegraphRecipe.js';
import {nodeTypes} from '../../../Library/Node/nodeTypes.js';
import * as services from '../services.js';

const log = logFactory(true, 'Nodegraph', 'navy');

export const NodegraphApp = class extends App {
  constructor(paths) {
    super(paths);
    this.services = services;
    this.persistor = new LocalStoragePersistor('user');
    this.graphs = [NodegraphGraph];
    this.nodeTypes = {...nodeTypes, ...nodegraphNodeTypes};
    //
    services.ArcService.nodeTypes = this.nodeTypes;
    services.ArcService.layoutInfo = {
      id: 'preview',
      defaultContainer: 'designer#graph'
    };
    //
    log('Welcome!');
  }
  async spinup() {
    await super.spinup();
    const {DevToolsRecipe, NodegraphRecipe, ...arcNodeTypes} = this.nodeTypes;
    this.arcs.set('user', 'nodeTypes', arcNodeTypes);
  }
};
