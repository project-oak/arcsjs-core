/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../Dom/xen/xen-async.js';
import {IconsCss} from '../../Dom/Material/material-icon-font/icons.css.js';

const {entries} = Object;

export class ResourceView extends Xen.Async {
  static get observedAttributes() {
    return ['version'];
  }
  update(_, state) {
    state.resources = globalThis.resources || {};
    state.canvases = entries(state.resources).filter(([name, res]) => res?.localName === 'canvas');
  }
  render({}, {canvases}) {
    return {
      canvi: canvases?.map(([name, res]) => ({key: name}))
    };
  }
  _didRender({}, {canvases}) {
    canvases?.map(([name, res]) => {
      const canvas = this.host.querySelector(`[key="${name}"]`);
      const ctx = canvas?.getContext('2d');
      if (res && res.width) {
        ctx?.drawImage(res, 0, 0, canvas.width, canvas.height);
      } else {
        // make an X?
      }
    });
  }
  get template() {
    return Xen.Template.html`
<style>
  ${IconsCss}
  :host {
    display: block;
  }
  [canvas] {
    margin: 12px;
  }
  canvas {
    border: 1px solid orange;
  }
</style>
<!-- <data-explorer object="{{resources}}"></data-explorer> -->
<h4>Canvas Resources</h4>
<div repeat="canvas_t">{{canvi}}</div>
<template canvas_t>
  <div canvas display="inline-block">
    <canvas key$="{{key}}" width="120" height="90"></canvas><br>
    <b>{{key}}</b>
  </span>
</template>
`
  }
}

customElements.define('resource-view', ResourceView);