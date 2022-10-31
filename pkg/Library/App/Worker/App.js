/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Arcs} from './Arcs.js';
import {loadCss} from '../../Dom/dom.js';
import {DevToolsRecipe} from '../../DevTools/DevToolsRecipe.js';
import {logFactory, makeId, makeName} from '../../Core/utils.min.js';
import {themeRules} from '../theme.js';

// n.b. lives in 'top' context

const log = logFactory(true, 'App', 'darkorange');

export const App = class {
  static get Arcs() {
    return Arcs;
  }
  constructor(paths, root) {
    this.paths = paths;
    this.root = root || document.body;
    log(JSON.stringify(paths, null, '  '));
  }
  get arcs() {
    return Arcs;
  }
  async spinup() {
    await Arcs.init({
      paths: this.paths,
      root: this.root,
      onservice: this.service.bind(this),
      injections: {themeRules, ...this.injections}
    });
    await loadCss(`${this.paths.$library ?? '.'}/Dom/Material/material-icon-font/icons.css`);
    // TODO(sjmiles): pick a syntax
    const assembly = [DevToolsRecipe, ...(this.userAssembly ?? this.recipes ?? [])];
    await Arcs.addAssembly('user', assembly);
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
        return (service[msg])(data);
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