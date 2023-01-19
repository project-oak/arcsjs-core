/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Arcs} from './Arcs.js';
import {Paths, logFactory, makeId, makeName} from '../../Core/utils.js';
import {DevToolsRecipe, DevToolsGraph} from '../../DevTools/DevToolsRecipe.js';
import {themeRules} from '../theme.js';

// n.b. lives in 'top' context

const log = logFactory(true, 'App', 'darkorange');

const {assign} = Object;

export const App = class {
  static get Arcs() {
    return Arcs;
  }
  constructor(paths, root) {
    this.paths = paths;
    this.root = root || globalThis.document?.body;
    this.log = log;
  }
  get arcs() {
    return Arcs;
  }
  async spinup() {
    await Arcs.init({
      paths: this.paths,
      onrender: this.render.bind(this),
      onservice: this.service.bind(this),
      injections: {themeRules, ...this.injections}
    });
    //
    Paths.add(this.paths);
    this.composer = await Arcs.createComposer(this.root || document.body);
    //
    this.graphs = [
      DevToolsGraph,
      ...(this.graphs ?? [])
    ];
    assign(this.nodeTypes, {DevToolsRecipe});
    //
    log('running app graphs...');
    await this.runGraphs(this.graphs, this.nodeTypes); //, this.layoutInfo);
  }
  async runGraphs(graphs, nodeTypes, layoutInfo) {
    const grapher = graph => Arcs.runGraph('user', graph, nodeTypes, layoutInfo);
    for (const graph of graphs) {
      await grapher(graph);
    }
  }
  render(packet) {
    // figure out which composer for this packet
    const composer = this.composers?.[packet?.arcid] ?? this.composer;
    composer?.render(packet);
  }
  async service({request}) {
    // if we are specific
    if (request?.kind) {
      // find that kind of service
      const service = this.services?.[request.kind];
      if (!service) {
        // user should know
        log.warn(`[${request?.kind}] is not registered`);
        return null;
      }
      // service gets request
      return this.dispatchServiceRequest(service, request);
    }
    // otherwise it's an App request
    return this.appService({request});
  }
  async dispatchServiceRequest(service, request) {
    try {
      const {kind, msg, data} = request || {};
      if (service[msg]) {
        return (service[msg])(data, this.arcs);
      } else {
        log.warn(`no handler for "${kind}:${msg}"`);
      }
    } catch (e) {
      log.warn(e.toString());
    }
  }
  async appService({request}) {
    // magic special services
    switch (request?.msg) {
      case 'makeName':
      case 'MakeName':
        return makeName();
      case 'makeId':
      case 'MakeId':
        return makeId(3, 4);
    }
    switch (request?.type) {
      case 'persist':
        return this.persist(request);
      case 'restore':
        return this.restore(request);
    }
    // any old subclass service
    const value = await this.onservice('user', 'host', request);
    log('service:', `[${request?.kind || 'App'}]`, request?.msg, '=', value);
    return value;
  }
  async onservice(user, host, request) {
    // abstract
  }
  async persist({storeId, data}) {
    await this.persistor?.persist(storeId, data);
    return true;
  }
  async restore({storeId}) {
    return this.persistor?.restore?.(storeId);
  }
  // (optional) support login convention
  getLoginBindings() {
    return [
      this.onStart?.bind(this),
      this.onLogin?.bind(this),
      this.onLogout?.bind(this),
    ];
  }
  bindLoginObserver(loginObserver) {
    return loginObserver(...this.getLoginBindings());
  }
};