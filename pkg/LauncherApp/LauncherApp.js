/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory, LocalStoragePersistor} from '../GraphAppSkeleton/arcs/arcs.js';
import {GraphApp} from '../GraphAppSkeleton/Library/GraphApp.js';
import {nodeTypes} from '../GraphAppSkeleton/arcs/nodeTypes.js';
import {services} from '../GraphAppSkeleton/arcs/services.js';
import {graph} from './graph.js';

const log = logFactory(true, 'LauncherApp', 'navy');

export const LauncherApp = class extends GraphApp {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.services = services;
    this.nodeTypes = nodeTypes;
    this.graph = graph;
  }
  async spinup() {
    await super.spinup();
    log('Welcome!');
  }
};
