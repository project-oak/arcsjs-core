/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../Dom/Xen/xen-async.js';
import {IconsCss} from '../../Dom/Material/material-icon-font/icons.css.js';
//import {Resources} from '../../App/Resources.js';

const {entries} = Object;

export class ResourceView extends Xen.Async {
  static get observedAttributes() {
    return ['resources', 'version'];
  }
  update({resources}, state) {
    state.resources = resources || globalThis.Resources.all();
    state.canvases = entries(state.resources).filter(([name, res]) => res?.localName === 'canvas');
  }
  render({}, {resources}) {
    const cap = s => `${s[0].toUpperCase()}${s.slice(1)}`;
    return {
      resources: entries(resources).filter(([name, res]) => name && res).map(([name, res]) => ({
        key: name,
        notCanvas: res?.localName !== 'canvas',
        notStream: !(res instanceof MediaStream),
        size: res?.width ? `(${res?.width} x ${res?.height})` : '',
        canvasRatio: `aspect-ratio: ${res?.width} / ${res?.height};`,
        typeof
          : res?.localName ? cap(res.localName)
          // : (res instanceof MediaStream) ? 'Stream'
          // : (res?.sampleRate) ? 'Audio'
          : (res?.constructor?.name)
          ?? typeof(res)
          ,
        stream: (res instanceof MediaStream) ? res : null,
      }))
    };
  }
  _didRender({}, {canvases}) {
    canvases?.map(([name, resource]) => {
      const previewCanvas = this.host.querySelector(`[key="${name}"]`);
      const ctx = previewCanvas?.getContext('2d');
      if (resource && resource.width) {
        const {width: w, height: h} = ctx.canvas;
        ctx.clearRect(0, 0, w, h);
        ctx?.drawImage(resource, 0, 0, w, h);
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
  [resource] {
    display: inline-flex;
    flex-direction: column;
    border: 1px solid orange;
    margin: 12px;
    padding: 8px;
    width: 124px;
  }
  canvas, video {
    border: 1px solid purple;
    width: 120px;
    height: 90px;
    object-fit: contain;
  }
  i {
    font-size: 0.75em;
  }
</style>
<!-- <data-explorer object="{{resources}}"></data-explorer> -->
<div repeat="resource_t">{{resources}}</div>
<template resource_t>
  <div resource>
    <b>{{typeof}}</b>
    <canvas xen:style="{{canvasRatio}}" hidden$="{{notCanvas}}" key$="{{key}}" width="120" height="90"></canvas>
    <video hidden$="{{notStream}}" srcobject="{{srcObject:stream}}" playsinline autoplay muted></video>
    <span>{{size}}</span><i>{{key}}</i>
  </span>
</template>
`;
  }
}

customElements.define('resource-view', ResourceView);