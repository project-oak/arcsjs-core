/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {App} from '../Worker/App.js';

export const GraphApp = class extends App {
  async spinup() {
    this.graphs = this.graphs ?? [this.graph];
    this.logInfo();
    await super.spinup();
  }
  logInfo() {
    this.log(this);
    // this.log.groupCollapsed('boot flavor');
    // this.log('paths', this.paths);
    // this.log('nodeTypes', this.nodeTypes);
    // this.log('services', this.services);
    // this.graphs('graphs', this.graphs);
    // this.log.groupEnd();
  }
};
