/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {App} from '../Worker/App.js';
import {Paths} from '../../Core/utils.js';

const GraphNode = {
  $meta: {
    id: 'GraphNode'
  },
  main: {
    $kind: '$library/App/Node/Graph'
  }
};

export const GraphApp = class extends App {
  async spinup() {
<<<<<<< HEAD
    this.nodeTypes.GraphNode = GraphNode;
    this.graphs = [
      this.graph
    ];
=======
    this.nodeTypes.GraphRecipe = GraphRecipe;
    this.graphs = [this.graph];
>>>>>>> d255e03 (some post #232 and merge cleanups /updates)
    Paths.add(this.paths);
    this.services.ArcService.nodeTypes = this.nodeTypes;
    this.services.ArcService.layoutInfo = {
      id: 'preview',
      defaultContainer: this.defaultContainer || 'designer#graph'
    };
    this.logInfo();
    await super.spinup();
  }

  logInfo() {
    this.log.groupCollapsed('Boot flavors');
    this.log('paths', this.paths);
    this.log('nodeTypes', this.nodeTypes);
    this.log('services', this.services);
    this.log.groupEnd();
  }
};
