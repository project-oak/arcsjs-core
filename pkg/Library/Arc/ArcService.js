/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../Core/core.js';

const log = logFactory(logFactory.flags.services || logFactory.flags.ArcService, 'ArcService', 'tomato');

export const ArcService = {
  // must be attached to the service by owner
  nodeTypes: {},
  layoutInfo: {},
  async addNamedGraph({arc, graphName, defaultContainer}, arcs) {
    if (arc && graphName) {
      log('addNamedGraph', arcName);
      //
      const graphs = await arcs.get('user', 'graphs');
      const graph = graphs.find(g => g?.$meta?.name === graphName); // ?? graphs?.[0];
      //
      const layoutInfo = {...this.layoutInfo};
      if (defaultContainer) {
        layoutInfo.defaultContainer = defaultContainer;
      }
      //
      if (graph) {
        arcs.runGraph(arc, graph, this.nodeTypes, layoutInfo);
      } else {
        log(`no graph named "${graphName}"`);
      }
    }
  },
  //
  // async addParticle({user, arc, meta, code}, arcs) {
  //   await arcs.createParticle(user, arc, meta, code);
  //   return true;
  // },
  // async destroyParticle({arc, name}, arcs) {
  //   await arcs.destroyParticle(name, arc);
  //   return true;
  // },
  // async updateParticle({arc, kind, code}, arcs) {
  //   await arcs.updateParticle(arc, kind, code);
  //   return true;
  // },
  //
  async runGraph({arc, graph, defaultContainer}, arcs) {
    //if (this.lastGraph) {
      //await this.removeGraph(this.lastGraph);
      //this.lastGraph = null;
    //}
    const layoutInfo = {...this.layoutInfo};
    if (defaultContainer) {
      layoutInfo.defaultContainer = defaultContainer;
    }
    return arcs.runGraph(arc || 'user', graph, this.nodeTypes, layoutInfo);
  },
  async removeGraph({arc, graph}, arcs) {
    arcs.removeGraph(arc || 'user', graph, this.nodeTypes);
  }
};
