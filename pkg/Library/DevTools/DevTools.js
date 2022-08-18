/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
  async update({show}, state, {service}) {
    if (show === true) {
      state.showTools = true;
      this.refresh(state, service);
    }
  },
  async refresh(state, service) {
    const context = await service({msg: 'request-context'});
    assign(state, context);
  },
  render({}, {runtime, showTools, om, capturedState}) {
    const user = runtime;
    const users = runtime?.users || {user};
    const storeBools = user && keys(user.stores).reduce((map, key) => (map[key] = false, map), {});
    return {
      om,
      showTools,
      particles: this.renderAllHosts(users),
      stores: this.renderAllStores(users),
      version: Math.random(),
      storeBools,
      capturedState
    };
  },
  map(object, visitor) {
    const result = {};
    object && entries(object).map(([name, elt]) => result[name] = visitor(elt));
    return result;
  },
  renderAllHosts(users) {
    const mapHosts = arcs => this.map(arcs, arc => this.renderHosts(arc.hosts));
    return this.map(users, user => mapHosts(user?.arcs));
  },
  renderHosts(hosts) {
    return this.map(hosts, ({meta, particle: {internal: {state, inputs}}}) => {
      const {runtime, ...filtered} = state;
      return {meta, inputs, state: filtered};
    });
  },
  renderAllStores(users) {
    return this.map(users, user => this.renderSimpleStores(user?.stores));
  },
  renderSimpleStores(stores) {
    const result = this.map(stores, ({data, meta}) => ({value: data, meta}));
    //const kbSize = value => !isNaN(value) ? `${(value / 1024).toFixed(1)} Kb` : '';
    entries(result).forEach(([name, store]) => {
      delete result[name];
      // TODO(sjmiles): really slow for big stores
      //result[`${name} (${kbSize(stores[name]?.save()?.length)})`] = store;
      result[`${name}`] = store;
    });
    return result;
  },
  async onToggleDevToolsClick(inputs, state, {service}) {
    if (this.toggleState(state, 'showTools')) {
      await this.refresh(state, service);
    }
  },
  toggleState(state, name) {
    return state[name] = !state[name];
  },
  async onRefreshClick(inputs, state, {service}) {
    await this.refresh(state, service);
  },
  async onCaptureState(inputs, state, {service}) {
    const capturedState = await service({kind: 'DevToolsService', msg: 'stateCapture'});
    state.capturedState = {state: capturedState};
  },
  async onCreateTest(inputs, state, {service}) {
    const capturedState = await service({kind: 'DevToolsService', msg: 'stateCapture'});
    const name = 'auto_captured_state';
    state.capturedState = {[name]: capturedState};
    const put = (url, body) => fetch(url, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body});
    put(`https://arcsjs-apps.firebaseio.com/test/specs/${name}.json`, JSON.stringify(capturedState));
  },
  template: html`
<style>
  :host {
    position: absolute;
    flex: 0 !important;
    --ui-page-background: #202124;
    --ui-nav-red: #C3291C;
    --ui-bright-red: #E24741;
    --mdc-icon-button-size: 32px;
    --mdc-theme-primary: #ffffff;
    --mdc-tab-text-label-color-default: var(--ui-bright-red);
    font-family: 'Google Sans', sans-serif;
    font-size: 14px;
  }
  data-explorer {
    padding: 8px;
  }
  [title] {
    font-size: 1.3em;
  }
  [devtools] {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 50%;
    min-width: min(320px, 100vw);
    max-width: min(100vw, 800px);
    z-index: 6000;
    transform: translateX(120%);
    transition: transform 200ms ease-in;
    box-shadow: rgb(38, 57, 77) 0px 20px 30px -10px;
    color: lightblue;
    background: #333;
  }
  [devtools][show] {
    transform: translateX(0);
  }
  [toolbar] {
    color: #ececec;
    background-color: var(--ui-nav-red);
  }
  /* beachball */
  [tools-button] {
    position: fixed;
    top: -15px;
    right: -15px;
    width: 32px;
    height: 32px;
    z-index: 9999;
    opacity: 0;
    transition: opacity 1s ease-out;
    border-radius: 50%;
  }
  [tools-button]:hover {
    opacity: 1;
  }
  [tools-button] > img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  [services] {
    padding: 12px;
  }
  [services] > img {
    border: 2px solid red;
  }
  surface-walker {
    padding: 8px;
  }
</style>

<!-- devtools button -->
<div tools-button on-click="onToggleDevToolsClick">
  <img src=${resolve('$library/App/assets/rainbow-128-opt.gif')}>
</div>

<!-- devtools flyout -->
<div devtools flex rows show$="{{showTools}}">
  <!-- top toolbar -->
  <div toolbar>
    <mwc-icon-button icon="close" on-click="onToggleDevToolsClick"></mwc-icon-button>
    <div flex title>Tools</div>
    <mwc-icon-button icon="refresh" on-click="onRefreshClick"></mwc-icon-button>
  </div>
  <!-- tabbed pages -->
  <mxc-tab-pages dark flex tabs="Stores,Arcs,Services,DOM,Tests,Graphs">
    <!-- Stores -->
    <data-explorer flex scrolling object="{{stores}}" expand></data-explorer>
    <!-- Arcs -->
    <data-explorer flex scrolling object="{{particles}}" expand></data-explorer>
    <!-- Services -->
    <div services flex scrolling>
      <resource-view version="{{version}}"></resource-view>
    </div>
    <!-- Surfaces -->
    <surface-walker flex scrolling></surface-walker>
    <!-- Tests -->
    <div flex rows>
      <!-- -->
      <div toolbar>
        <input flex value="auto_captured_state">
        <button on-click="onCreateTest">Create</button>
      </div>
      <div toolbar>
        <div flex title>Inputs</div>
      </div>
      <data-explorer flex scrolling object="{{storeBools}}" expand></data-explorer>
      <div toolbar>
         <div flex title>State</div>
         <mwc-icon-button icon="refresh" on-click="onCaptureState"></mwc-icon-button>
      </div>
      <data-explorer flex scrolling object="{{capturedState}}" expand></data-explorer>
      <!-- -->
    </div>
    <!-- Diagrams -->
    <div flex rows>
      <!-- <data-graph object="{{context}}" flex x3></data-graph> -->
    </div>
  </mxc-tab-pages>
</div>
`
});
