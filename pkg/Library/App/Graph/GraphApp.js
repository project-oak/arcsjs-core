/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {App} from '../Worker/App.js';
import {Paths} from '../../Core/utils.js';

const GraphRecipe = {
  $meta: {name: 'GraphRecipe', id: 'GraphRecipe'},
  main: {
    // n.b. the GraphRecipe actually only wants the rectangles from the graph layouts
    $kind: '$library/App/Node/Graph'
  }
};

export const GraphApp = class extends App {
  async spinup() {
    this.nodeTypes.GraphRecipe = GraphRecipe;
    this.graphs = [
      this.graph,
      //this.configureGraph(this.graph)
    ];
    Paths.add(this.paths);
    this.services.ArcService.nodeTypes = this.nodeTypes;
    this.services.ArcService.layoutInfo = {
      id: 'preview',
      defaultContainer: this.defaultContainer || 'designer#graph'
    };
    this.logInfo();
    await super.spinup();
  }

  configureGraph(graph, layoutId) {
    return {
      $meta: {
        id: 'graph-graph',
        name: 'graph-graph'
      },
      nodes: [{
        type: 'GraphRecipe',
        props: {graph, layoutId}
      }]
    };
  }

  logInfo() {
    this.log.groupCollapsed('Boot flavors');
    this.log('paths', this.paths);
    this.log('nodeTypes', this.nodeTypes);
    this.log('services', this.services);
    this.log.groupEnd();
  }
};
