/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory, LocalStoragePersistor} from './arcs/arcs.js';
import {nodeTypes} from './arcs/nodeTypes.js';
import {services} from './arcs/services.js';
import {GraphApp as App} from './Library/GraphApp.js';
import {graph} from './graph.js';

const log = logFactory(true, 'GraphApp', 'navy');

export const GraphApp = class extends App {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.services = services;
    this.nodeTypes = nodeTypes;
    this.graph = graph;
    log('Welcome!');
  }
};
