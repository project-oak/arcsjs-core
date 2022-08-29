/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../Dom/Xen/xen-async.js';
import {IconsCss} from '../../Dom/Material/material-icon-font/icons.css.js';
import {Resources} from '../../App/Resources.js';

const {entries} = Object;

export class ResourceView extends Xen.Async {
  static get observedAttributes() {
    return ['version'];
  }
  update(_, state) {
    state.canvases = entries(Resources.all()).filter(([name, res]) => res?.localName === 'canvas');
  }
  render({}, {canvases}) {
    return {
      resources: entries(Resources.all()).filter(([name, res]) => name && res).map(([name, res]) => ({
        key: name,
        notCanvas: res?.localName !== 'canvas',
        notStream: !(res instanceof MediaStream),
        typeof:
          res?.localName === 'canvas' ? 'Canvas'
          : (res instanceof MediaStream) ? 'Stream'
          : (res?.sampleRate) ? 'Audio'
          : typeof(res),
        stream: (res instanceof MediaStream) ? res : null,
      }))
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
  [resource] {
    display: inline-flex;
    flex-direction: column;
    border: 1px solid orange;
    margin: 12px;
    padding: 8px;
  }
  canvas, video {
    border: 1px solid purple;
    width: 120px;
    height: 90px;
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
    <canvas hidden$="{{notCanvas}}" key$="{{key}}" width="120" height="90"></canvas>
    <video hidden$="{{notStream}}" srcobject="{{srcObject:stream}}" playsinline autoplay muted></video>
    <i>{{key}}</i>
  </span>
</template>
`;
  }
}

customElements.define('resource-view', ResourceView);