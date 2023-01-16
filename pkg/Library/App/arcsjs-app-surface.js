/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Xen} from '../Dom/Xen/xen-async.js';
import {dom, loadScript} from '../Dom/Dom.js';
import '../Mediapipe/PoseServiceLoader.js';
import {themeRules} from './theme.js';
import {boot} from './Common/boot.js';
import {graph} from '../../Apps/GraphRunner/graph.js';

const Library = `${globalThis.config?.arcsPath}/Library`;

export const ArcsJsApp = class extends Xen.Async {
  get host() {
    return this;
  }
  _didMount() {
    dom('link', {rel: 'icon', href: `${Library}/App/Common/arcs/icon.png`}, document.head);
    // loadScript(`${Library}/Mediapipe/PoseServiceLoader.js`);
    loadScript(`${Library}/../third_party/pixijs/pixi.6.5.7.min.js`);
    //loadScript(`${library}/../third_party/pixijs/pixi-plugins/pixi-spine.js`);
    boot(import.meta.url, {graph});
  }
  get template() {
    return Xen.html`
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="stylesheet" href="${Library}/Dom/Material/material-icon-font/icons.css">
<title>ArcsJsApp! An ArcsJs Graph</title>
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

customElements.define('arcsjs-app-surface', ArcsJsApp);
