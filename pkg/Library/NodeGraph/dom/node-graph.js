/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Xen} from '../../Dom/Xen/xen-async.js';
// import {XenCss} from '../Dom/Material/material-xen/xen.css.js';

export class NodeGraph extends Xen.Async {
  static get observedAttributes() {
    return ['graph', 'nodes'];
  }
  get host() {
    return this;
  }
  get template() {
    return template;
  }
  get container() {
    return this._dom.root;
  }
  _didMount() {
    this.canvas = this.querySelector('canvas');
    this.rects = {};
  }
  onNodeSelect(event) {
    //event.stopPropagation();
    this.key = event.currentTarget.key;
    this.fire('node-selected');
  }
  onUpdateBox({currentTarget: {value: rect}}) {
    this.rects[this.key] = rect;
    this.invalidate();
  }
  geom(key, i) {
    if (this.rects[key]) {
      const {l, t, w, h} = this.rects[key];
      const [w2, h2] = [w/2, h/2];
      return {x: l+w2, y: t+h2, l, t, r: l+w, b: t+h, w, h, w2, h2};
    } else {
      const [width, height, cols, margin, ox, oy] = [140, 60, 8, 50, 100, 128];
      const p = i => ({
        x: (i%cols)*(width+margin) + ox,
        y: Math.floor(i/cols)*(height+margin) + margin*(i%2) + oy
      });
      const o = p(i % 3);
      const [w, h, w2, h2] = [width, height, width/2, height/2];
      return {x: o.x, y: o.y, l: o.x-w2, t: o.y-h2, r: o.x+w2, b: o.y+w2, w, h, w2, h2};
    }
  }
  render({graph}, {x, y}) {
    return {
      nodes: graph?.graphNodes.map((n, i) => {
        const g = this.geom(n.key, i);
        return {
          ...n,
          inputs: n.inputs?.map(({name, type}) => ({name, type, title: `${name}: ${type}`})),
          outputs: n.outputs?.map(({name, type}) => ({name, type, title: `${name}: ${type}`})),
          style: {
            borderColor: n.selected ? n.color : n.bgColor,
            color: n.selected ? 'white' : 'gray',
            background: n.bgColor,
            transform: `translate(${g.l}px, ${g.t}px)`,
          }
        };
      })
    };
  }
  _didRender({graph}, {x, y}) {
    this.renderCanvas({graph}, {x, y});
  }
  renderCanvas({graph}, {x, y}) {
    const ctx = this.canvas?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      //console.log('=');
      graph?.graphEdges.map((edge, i) => {
        const spacing = 16;
        //
        const i0 = graph.graphNodes.findIndex(({key}) => key === edge.from.id);
        const i0outs = graph.graphNodes[i0].outputs;
        const ii0 = i0outs.findIndex(({name}) => name === edge.from.storeName);
        const ii0c = /*Math.floor(*/i0outs.length / 2/*)*/ - 0.5;
        //console.log('out', i0, ii0, ii0c, edge.from.storeName);
        const i0offset = spacing * (ii0-ii0c);
        const g0 = this.geom(edge.from.id, i0);
        //
        const i1 = graph.graphNodes.findIndex(({key}) => key === edge.to.id);
        const i1ins = graph.graphNodes[i1].inputs;
        const ii1 = i1ins.findIndex(({name}) => name === edge.to.storeName);
        const ii1c = /*Math.floor(*/i1ins.length / 2/*)*/ - 0.5;
        //console.log('in', i1, ii1, ii1c, edge.to.storeName);
        const i1offset = spacing * (ii1-ii1c);
        const g1 = this.geom(edge.to.id, i1);
        //
        const p0 = {x: g0.r, y: g0.y + i0offset};
        const p1 = {x: g1.l, y: g1.y + i1offset};
        const path = this.getEdgePath(p0, p1);
        //
        this.curve(ctx, path);
        //
        //ctx.fillStyle = edge.color;
        ctx.fillStyle = 'blue';
        ctx.strokeStyle = 'white';
        this.circle(ctx, p0, 3.5); ctx.stroke();
        this.circle(ctx, p1, 3.5); ctx.stroke();
      });
    }
  }
  getEdgePath({x:startX, y:startY}, {x:endX, y:endY}) {
    // if (startX < endX) {
      return [
        startX, startY,
        startX + (endX - startX) / 2, startY,
        endX - (endX - startX) / 2, endY,
        endX, endY
      ];
    // } else {
    //   return [
    //     startX, startY - 50,
    //     startX + (endX - startX) / 2, startY,
    //     endX - (endX - startX) / 2, endY,
    //     endX, endY + 50
    //   ];
    // }
  }
// roundedRect(ctx, x, y, width, height, radius) {
  //   ctx.beginPath();
  //   ctx.lineWidth = 2;
  //   ctx.lineJoin = "round";
  //   ctx.moveTo(x, y + radius);
  //   ctx.arcTo(x, y + height, x + radius, y + height, radius);
  //   ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  //   ctx.arcTo(x + width, y, x + width - radius, y, radius);
  //   ctx.arcTo(x, y, x, y + radius, radius);
  // }
  circle(ctx, c, r) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI*2);
    ctx.fill();
  }
  curve(ctx, path) {
    //const ir = r => Math.round(Math.random() * r);
    const highlight = [210, 210, 255];
    // lasers!!!!
    for (let i=5; i>=0; i--) {
      ctx.beginPath();
      // draw each line, the last line in each is always white
      ctx.lineWidth = (i+1)*4-3;
      ctx.strokeStyle = !i ? '#fff' : `rgba(${highlight[0]},${highlight[1]},${highlight[2]},${0.25-0.03*i})`;
      ctx.moveTo(path[0], path[1]);
      ctx.bezierCurveTo(path[2], path[3], path[4], path[5], path[6], path[7]);
      ctx.stroke();
      ctx.closePath();
    }
  };
}

const template = Xen.Template.html`
<style>
  :host {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  [node] {
    display: flex;
    align-items: stretch;
    justify-content: center;
    /**/
    position: absolute;
    min-width: 100px;
    min-height: 60px;
    /**/
    border-radius: 16px;
    border: 2px solid violet;
    padding: 6px;
    background: purple;
    font-size: 11px;
    font-weight: bold;
    /* overflow: hidden; */
    cursor: pointer;
  }
  [node] span {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  [node][selected] {
    border: 3px solid violet;
    padding: 5px;
    box-shadow:  23px 23px 46px #bebebe88, -23px -23px 46px #ffffff88;
  }
  [node]:not([selected]) {
    box-shadow:  9px 9px 18px #cecece88, -9px -9px 18px #f2f2f288;
  }
  /**/
  [layer0] {
    position: absolute;
    inset: 0;
  }
  [layer0] > * {
    position: absolute;
    inset: 0;
  }
  [layer1] {
    position: absolute;
    pointer-events: none;
  }
  [repeat="socket_i_t"], [repeat="socket_o_t"] {
    width: 48px;
    opacity: 0.8;
  }
  [repeat="socket_i_t"]:hover, [repeat="socket_o_t"]:hover {
    opacity: 1;
  }
  [dot] {
    display: inline-block;
    width: 12px;
    height: 12px;
    background: orange;
    border: 1px solid #555;
    border-radius: 50%;
  }
  [bar] {
    padding-bottom: 4px;
  }
</style>

<div layer0>
  <designer-layout
    on-update-box="onUpdateBox"
    Xon-position="onNodePosition"
    on-delete="onNodeDelete"
    repeat="node_t"
  >{{nodes}}</designer-layout>
</div>

<!-- <div layer0 repeat="node_t">{{nodes}}</div> -->
<canvas layer1 width="2000" height="800"></canvas>

<template node_t>
  <div node key="{{key}}" selected$="{{selected}}" xen:style="{{style}}" on-mousedown="onNodeSelect">

    <div centering column repeat="socket_i_t" style="margin-left: -13px;">{{inputs}}</div>

    <div flex center row style="padding: 0 4px;">
      <span>{{displayName}}</span>
    </div>

    <div centering column repeat="socket_o_t" style="margin-right: -18px;">{{outputs}}</div>

  </div>
</template>

<template socket_i_t>
  <div bar title="{{title}}">
    <span dot></span>
    <span style="width: 32px; overflow: hidden; text-overflow: ellipsis; font-size: 8px; padding-left: 3px; text-align: left;">{{name}}</span>
  </div>
</template>

<template socket_o_t>
  <div bar title="{{title}}">
    <span style="width: 32px; overflow: hidden; text-overflow: ellipsis; font-size: 8px; padding-right: 3px; text-align: right;">{{name}}</span>
    <span dot></span>
  </div>
</template>

`;

customElements.define('node-graph', NodeGraph);
