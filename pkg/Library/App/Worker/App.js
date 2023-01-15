/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Arcs} from './Arcs.js';
//import {loadCss} from '../../Dom/dom.js';
import {DevToolsRecipe, DevToolsGraph} from '../../DevTools/DevToolsRecipe.js';
// import {NodeTypesNode} from '../../Node/NodeTypesNode.js';
import {logFactory, makeId, makeName} from '../../Core/utils.min.js';
import {themeRules} from '../theme.js';
import {NodeTypesNode} from '../../Node/NodeTypesNode.js';

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
    //log(JSON.stringify(paths, null, '  '));
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
    //await loadCss(`${this.paths.$library ?? '.'}/Dom/Material/material-icon-font/icons.css`);
    this.composer = await Arcs.createComposer(this.root || document.body);
    //
    assign(this.nodeTypes, {
      DevToolsRecipe,
      NodeTypesNode
    });
    //
    // const GlobalsGraph = {
    //   $meta: {
    //     id: 'GlobalsGraph'
    //   },
    //   $stores: {
    //     nodeTypes: {
    //       $type: 'Pojo',
    //       $value: this.nodeTypes
    //     }
    //   }
    // };
    //
    this.graphs = [
      // GlobalsGraph,
      DevToolsGraph,
      ...(this.graphs ?? [])
    ];
    await this.runGraphs(this.graphs, this.nodeTypes);
    // TODO(sjmiles): fix
    //return new Promise(resolve => setTimeout(resolve, 250));
  }
  async runGraphs(graphs, nodeTypes) {
    const grapher = graph => Arcs.runGraph('user', graph, nodeTypes);
    for (const graph of graphs) {
      await grapher(graph);
    }
    //return Promise.all(this.graphs.map(grapher));
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