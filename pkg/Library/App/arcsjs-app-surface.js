/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import '../Mediapipe/PoseServiceLoader.js';
import {Xen} from '../Dom/Xen/xen-async.js';
import {dom, loadScript} from '../Dom/Dom.js';
import {boot} from './Common/boot.js';
import {themeRules} from './theme.js';
import {Params} from './Params.js';

const Library = `${globalThis.config?.arcsPath}/Library`;

export const ArcsJsAppSurface = class extends Xen.Async {
  static get observedAttributes() {
    return ['path', 'graph'];
  }
  get host() {
    return this;
  }
  _didMount() {
    dom('link', {rel: 'icon', href: `${Library}/App/Common/arcs/icon.png`}, document.head);
    loadScript(`${Library}/../third_party/pixijs/pixi.6.5.7.min.js`);
    //loadScript(`${library}/../third_party/pixijs/pixi-plugins/pixi-spine.js`);
  }
  shouldUpdate(inputs, state) {
    return !state.running;
  }
  update({path, graph}, state) {
    if (!graph) {
      graph = this.maybeLoadStorageGraph(path ?? Params.getParam('path'));
    }
    if (graph) {
      state.running = true;
      this.bootGraph(graph);
    }
  }
  maybeLoadStorageGraph(path) {
    const name = path;
    if (name) {
      const graphs = JSON.parse(localStorage.getItem('user/graph/0.4.5/graphs'));
      return graphs.find(g => g?.$meta?.name === name);
    }
  }
  bootGraph(graph) {
    const nodeKey = Object.keys(graph.nodes).find(key => key.includes('NodeDesignerNode'));
    const defaultContainer = `${nodeKey}_designer#graph`;
    // this.defaultContainer = defaultContainer;
    // this.graph = graph;
    // boot(import.meta.url);
    const url = document.URL;
    boot(url, {
      graph,
      defaultContainer
    });
  }
  get template() {
    return Xen.html`
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="stylesheet" href="${Library}/Dom/Material/material-icon-font/icons.css">
<style>
  html, body {
    height: 100%;
  }
  body {
    margin: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  body, button, input {
    font-family: 'Google Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  par-ticle, [particle] {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
<style>
  ${`:root {
    ${themeRules}
  }`}
</style>
`
  }
};

customElements.define('arcsjs-app-surface', ArcsJsAppSurface);
