/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
/* global themeRules */
({
  async update({graphs, show}, state, {service}) {
    if (graphs && !state.selectedGraph) {
      state.selectedGraph = graphs?.[0];
      state.graphText = JSON.stringify(state.selectedGraph, null, '  ');
    }
    if (show === true) {
      state.showTools = true;
      this.refresh(state, service);
    }
  },
  async refresh(state, service) {
    const context = await service({msg: 'request-context'});
    assign(state, context);
    state.kick = Math.random();
  },
  render({graphs}, {runtime, showTools, capturedState, kick, graphText}) {
    const user = runtime;
    const users = runtime?.users || {user};
    const storeBools = user && keys(user.stores).reduce((map, key) => (map[key] = false, map), {});
    const hosts = this.renderAllHosts(users);
    const stores = this.renderAllStores(users);
    const context = {
      stores: stores.user,
      hosts: hosts.user
    };
    //
    const graphOptions = !graphs ? [] : graphs.map(({$meta}) => $meta);
    //
    return {
      kick,
      showTools,
      particles: hosts,
      stores,
      context, // {stores: stores.user, hosts: hosts.user},
      version: Math.random(),
      storeBools,
      capturedState,
      graphText,
      graphOptions
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
      const filtered = {};
      keys(state)
        .filter(key => (key !== 'runtime') && (typeof state[key] !== 'function'))
        .forEach(key => filtered[key] = state[key])
        ;
      return {meta, inputs, state: filtered};
    });
  },
  renderAllStores(users) {
    return this.map(users, user => this.renderSimpleStores(user?.stores));
  },
  renderSimpleStores(stores) {
    const result = {};
    const mappedStores = this.map(stores, ({data, meta}) => ({value: data, meta}));
    //const kbSize = value => !isNaN(value) ? `${(value / 1024).toFixed(1)} Kb` : '';
    entries(mappedStores).forEach(([name, store]) => {
      // TODO(sjmiles): really slow for big stores
      //result[`${name} (${kbSize(stores[name]?.save()?.length)})`] = store;
      result[name] = store;
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
    return this.refresh(state, service);
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
  async onTabSelected(inputs, state, {service}) {
    return this.refresh(state, service);
  },
  onSelectGraph({eventlet: {value}, graphs}, state) {
    state.selectedGraph = graphs?.find(({$meta}) => $meta?.name === value);
    state.graphText = JSON.stringify(state.selectedGraph, null, '  ');
  },
  onGraphCodeChanges({eventlet: {value}}, state) {
    state.graphText = value;
  },
  async onAddGraphClick({}, {graphText}, {service}) {
    const graph = JSON.parse(graphText);
    if (graph) {
      return service({msg: 'addGraph', data: {graph}});
    }
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
    mxc-tab-pages {
      background-color: inherit;
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
    <mxc-tab-pages dark flex tabs="Stores,Graphs,Particles,Resources,DOM,Charts,Tests" on-selected="onTabSelected">
      <!-- Stores -->
      <data-explorer flex scrolling object="{{stores}}" expand></data-explorer>
      <!-- Graphs -->
      <div flex scrolling>
        <div toolbar>
          <multi-select options="{{graphOptions}}" on-change="onSelectGraph"></multi-select>
          <mwc-icon-button icon="refresh" on-click="onAddGraphClick"></mwc-icon-button>
        </div>
        <code-mirror flex text="{{graphText}}" on-changes="onGraphCodeChanges"></code-mirror>
      </div>
      <!-- Arcs -->
      <data-explorer flex scrolling object="{{particles}}" expand></data-explorer>
      <!-- Services -->
      <div services flex scrolling>
        <resource-view version="{{version}}"></resource-view>
      </div>
      <!-- Surfaces -->
      <surface-walker flex scrolling kick="{{kick}}"></surface-walker>
      <!-- Diagrams -->
      <div flex rows>
        <data-graph object="{{context}}" flex x3></data-graph>
      </div>
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
    </mxc-tab-pages>
  </div>
  `
});
