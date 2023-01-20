/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Arc, Graphinator, logFactory} from '../Core/core.js';

const log = logFactory(logFactory.flags.services || logFactory.flags.ArcService, 'ArcService', 'tomato');

export const ArcService = async (runtime, host, request) => {
  return ArcService[request.msg]?.(runtime, host, request.data);
};

Object.assign(ArcService, {
  async requireArc(runtime, arc) {
    return (this.getArc(runtime, arc)) ?? (this.createArc(runtime, arc));
  },
  getArc(runtime, arc) {
    return runtime.arcs[arc];
  },
  async createArc(runtime, arc) {
    const realArc = new Arc(arc);
    // observe store changes
    //realArc.listen('store-changed', storeChanged.bind(null, arc));
    // send render packets to composer
    //realArc.composer = this;
    // async service interface for Particles
    //realArc.service = async (host, request) => this.serviceHandler(realArc, host, request);
    // connect arc to runtime
    return runtime.addArc(realArc);
  },
  //
  async addArcGraph(runtime, host, {arc, graph, nodeTypes, defaultContainer}) {
    if (arc && graph) {
      const realArc = await this.requireArc(runtime, arc);
      if (realArc) {
        realArc.composer = host.arc.composer;
        log('addArcGraph', realArc, graph);
        this.runGraph(runtime, host, {graph, nodeTypes, defaultContainer}, realArc);
      }
    }
  },
  //
  async runGraph(runtime, host, {graph, nodeTypes, defaultContainer}, arc) {
    if (!nodeTypes) {
      log.warn('runGraph: `nodeTypes` is empty');
    } else return (new Graphinator(nodeTypes, runtime, arc ?? host.arc))
      .execute(graph, {
        id: 'preview',
        defaultContainer: `${host.id}#${defaultContainer}`
      });
  },
  //
  async removeGraph(runtime, host, {graph, nodeTypes}) {
    if (!nodeTypes) {
      log.warn('runGraph: `nodeTypes` is empty');
    } else return (new Graphinator(nodeTypes, user, host.arc))
      .evacipate(graph);
  }
});
