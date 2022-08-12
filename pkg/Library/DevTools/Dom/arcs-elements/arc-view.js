/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../../Dom/xen/xen-async.js';
import {IconsCss} from '../../../Dom/material-icon-font/icons.css.js';

import '../data-explorer/data-explorer.js';

const template = Xen.Template.html`
<style>
  ${IconsCss}
  :host {
    display: block;
    font-size: 10px;
    background: #e6f5e7;
  }
  [header] {
    padding: 8px 6px;
    display: flex;
    align-items: center;
    font-size: 125%;
    line-height: 150%;
  }
  [arc] {
    border-bottom: 1px dotted silver;
  }
  [data] {
    overflow: hidden;
    box-sizing: border-box;
    transition: all 300ms ease-out;
  }
  [arcs] {
    color: black;
  }
</style>

<div arcs>
  <div header>
    <b><span>Arcs View</span></b>
  </div>
  <div>{{arcs}}</div>
</div>
`;

const arcTemplate = Xen.Template.html`
  <div arc key="{{id}}">
    <div header>
      <b><span>{{name}}</span></b>:&nbsp;
    </div>
    <div data>
      <div style="padding: 8px 6px;">
        <div style="border-bottom: 1px dotted silver; margin-bottom: 2px; text-align: right;">id: <span>{{id}}</span></div>
        <data-explorer style="font-size: 14px;" object="{{data}}"></data-explorer>
      </div>
    </div>
  </div>
`;

export class ArcView extends Xen.Async {
  static get observedAttributes() {
    return ['arcarray'];
  }
  get template() {
    return template;
  }
  update({arcarray}, state) {
    if (arcarray && arcarray !== state.arcarray) {
      state.arcarray = arcarray;
    }
  }
  shouldRender({arcarray}) {
    return Boolean(arcarray);
  }
  render({arcarray}) {
    //console.log("updating");
    return {
      arcs: this.renderList(arcTemplate, arcarray, this.renderArcModel)
    };
  }
  renderList(template, items, renderItem) {
    return {template, models: items.map(renderItem.bind(this))};
  }
  setArcListener(arc, state) {
    state.listener = arc.listen(`${arc.id}-changed`, this.onArcChange.bind(this));
  }
  renderArcModel(arc) {
    let particles = {};
    Object.keys(arc.hosts).map(function(key, index) {
      let particleName = `Particle [${key}]`;
      if(arc.hosts[key].particle) {
        particles[particleName] = {...arc.hosts[key].particle.pendingInputs, kind: arc.hosts[key].meta.kind};
        // Delete runtime as this would cause a cycle.
        delete particles[particleName]["runtime"];
      }
    });
    return {
      name: arc.meta.description,
      id: arc.id,
      data: particles
    };
  }
}
