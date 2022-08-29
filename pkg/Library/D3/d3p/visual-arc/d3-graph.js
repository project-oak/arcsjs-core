/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../xen/xen-async.js';
import {XenCss} from '../../material-xen/xen.css.js';
import {d3} from '../d3.js';

const template = Xen.Template.html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  * {
    box-sizing: border-box;
  }
  [frame] {
    border: 2px solid magenta;
  }
  ${XenCss}
</style>

<div flex rows>
  <div toolbar>
    <mwc-icon-button icon="add_circle_outline" on-click="onPlus"></mwc-icon-button>
    <mwc-icon-button icon="remove_circle_outline" on-click="onMinus"></mwc-icon-button>
  </div>
  <div flex frame></div>
</div>
`;

//const {entries} = Object;

// convert array to dictionary, using key-field `key`
// [{[key], ...}, ...] => {key: {...}, ...}
//const tupleate = (items, key) => items.reduce((dict, value) => Object.assign(dict, {[value[key]]: value}), {});

export class D3Graph extends Xen.Async {
  static get observedAttributes() {
    return ['object'];
  }
  get template() {
    return template;
  }
  get container() {
    return this._dom.root;
  }
  update({object}, state) {
    if (!state.svg) {
      state.svg = d3
        .select(this.container)
        .select('[frame]')
        .append('svg')
          .attr("viewBox", [0, 0, 1000, 1000])
        ;
    }
    if (!state.data) {
      state.data = []; //{id: 0}, {id: 1}, {id: 2}];
    }
  }
  onPlus() {
    const {data} = this.state;
    const i = data.length;
    this.mergeState({data: [...data, {
      id: i,
      color: d => d3.interpolateSinebow(i/20),
      cx: i * 24 + 32,
      cy: Math.sin(Math.PI*i/10) * 96 + 196,
      label: `Yo (${i})`
    }]});
  }
  onMinus() {
    this.mergeState({data: this.state.data.slice(0, -1)});
  }
  render({}, {svg, data}) {
    this.updateGraph(svg, data);
  }
  updateGraph(root, data) {
    // the group selection
    const group = root
      .selectAll('g')
      .data(data)
      ;
    // the enter selection, with added groups
    const enter = group.enter().append('g')
      .on('click', function (e) {
        d3.select(this).raise();
      })
      ;
    enter.append('circle')
      .attr('fill', '#008080')
      .attr('stroke', '#333')
      .attr('stroke-width', 3)
      .attr('r', 12)
      .attr('opacity', 1)
      ;
    enter.append('text')
      .attr("font-size", 16)
      .attr("stroke", "#333")
      .attr("stroke-width", 1.5)
      .attr("transform", d => `translate(${d.cx} ${d.cy})`)
      .attr("text-anchor", "middle")
      .text(d => d.label)
      ;
    // everybody gets this stuff
    enter.merge(group)
      .attr('cursor', 'pointer')
      .attr('opacity', 1)
      .select('circle')
        .attr('fill', d => d.color(d))
        .attr('cx', d => d.cx)
        .attr('cy', d => d.cy)
      ;
    enter.transition()
      .duration(300)
      .ease(d3.easeBounceOut)
      .select('circle')
        .attr('r', 32)
      ;
    group.exit().transition()
      .remove()
      .duration(300)
      .attr('opacity', 0)
      .select('circle')
        .attr('r', 0)
      ;
  }
}

customElements.define('d3-graph', D3Graph);
