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
import {logFactory} from '../../../core/utils.min.js';

// n.b. lives in 'top' context

const log = logFactory(true, 'App', 'darkorange');

export const App = class {
  static get Arcs() {
    return Arcs;
  }
  constructor(paths, root) {
    this.paths = paths;
    this.root = root;
  }
  get arcs() {
    return Arcs;
  }
  async spinup() {
    await Arcs.init({
      paths: this.paths,
      root: this.root || document.body,
      onservice: this.service.bind(this),
      injections: this.injections
    });
    await loadCss(`${this.paths.$library ?? '.'}/Dom/Material/material-icon-font/icons.css`);
    // TODO(sjmiles): pick a syntax
    const assembly = [DevToolsRecipe, ...(this.userAssembly ?? this.recipes ?? [])];
    Arcs.addAssembly(assembly, 'user');
  }
  async service({request}) {
    switch (request?.type) {
      case 'persist':
        return this.persist(request);
      case 'restore':
        return this.restore(request);
      default: {
        if (this.appService({request}) === undefined) {
          this.services({request});
        }
        break;
      }
    }
  }
  async services({request}) {
    const service = this.services?.[request?.type];
    if (service) {
      log('service', request, service);
      try {
        if (service[request.msg]) {
          return (service[request.msg])(request.data);
        } else {
          log.warn(`no handler for "${request.msg}"`);
        }
      } catch (e) {
        log.warn(e.toString());
      }
    }
  }
  async appService({request}) {
    const value = await this.onservice?.('user', 'host', request);
    log('service:', request?.msg, '=', value);
    return value || null;
  }
  async persist({storeId, data}) {
    await this.persistor?.persist(storeId, data);
    return true;
  }
  async restore({storeId}) {
    return this.persistor?.restore(storeId);
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