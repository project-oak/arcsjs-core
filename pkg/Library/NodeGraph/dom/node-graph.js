/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Xen} from '../../Dom/Xen/xen-async.js';
// import {XenCss} from '../Dom/Material/material-xen/xen.css.js';

export class NodeGraph extends Xen.Async {
  static get observedAttributes() {
    return ['graph', 'rects'];
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
    this.value = rect;
    this.fire('node-moved')
    this.rects[this.key] = rect;
    this.invalidate();
  }
  geom(key, i) {
    if (this.rects?.[key]) {
      const {l, t, w, h} = this.rects[key];
      const [w2, h2] = [w/2, h/2];
      return {x: l+w2, y: t+h2, l, t, r: l+w, b: t+h, w, h, w2, h2};
    } else {
      // console.log(key);
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
    let selected = null;
    const model = {
      nodes: graph?.graphNodes.map((n, i) => {
        const g = this.geom(n.key, i);
        if (n.selected) {
          selected = n;
        }
        return {
          ...n,
          nodeId: `ng${n.key}`,
          inputs: n.inputs?.map(({name, type}) => ({name, type, title: `${name}: ${type}`})),
          outputs: n.outputs?.map(({name, type}) => ({name, type, title: `${name}: ${type}`})),
          nameStyle: {
            borderRadius: '11px 11px 0 0',
            borderColor: n.selected ? n.color : n.bgColor,
            background: n.selected ? n.color : n.bgColor,
            fontSize: '0.8em'
          },
          style: {
            borderColor: n.selected ? n.color : n.bgColor,
            color: n.selected ? 'white' : 'gray',
            background: n.bgColor,
            transform: `translate(${g.l}px, ${g.t}px)`,
          }
        };
      })
    };
    model.selectedKeys = selected?.key ? [`ng${selected.key}`] : null;
    return model;
  }
  _didRender({graph}, {x, y}) {
    if (this.rects) {
      this.renderCanvas({graph}, {x, y});
    }
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
        const i0outs = graph.graphNodes[i0]?.outputs;
        const ii0 = i0outs.findIndex(({name}) => name === edge.from.storeName);
        const ii0c =i0outs.length / 2 - 0.5;
        //console.log('out', i0, ii0, ii0c, edge.from.storeName);
        const i0offset = spacing * (ii0-ii0c) + 9;
        const g0 = this.geom(edge.from.id, i0);
        //
        const i1 = graph.graphNodes.findIndex(({key}) => key === edge.to.id);
        const i1ins = graph.graphNodes[i1]?.inputs;
        const ii1 = i1ins.findIndex(({name}) => name === edge.to.storeName);
        const ii1c = i1ins.length / 2 - 0.5;
        //console.log('in', i1, ii1, ii1c, edge.to.storeName);
        const i1offset = spacing * (ii1-ii1c) + 9;
        const g1 = this.geom(edge.to.id, i1);
        //
        const p0 = {x: g0.r - 1, y: g0.y + i0offset};
        const p1 = {x: g1.l + 1, y: g1.y + i1offset};
        const path = this.calcBezier(p0, p1);
        //
        //this.curve(ctx, path);
        //const highlight = [[210, 210, 255], [255, 210, 210], [210, 255, 210]][i%3];
        const highlight = [[21, 100, 100], [100, 21, 21], [21, 100, 21]][i%3];
        this.laserCurve(ctx, path, highlight);
        //
        //ctx.fillStyle = edge.color;
        ctx.fillStyle = 'lightblue';
        ctx.strokeStyle = 'white';
        this.circle(ctx, p0, 3.5);
        ctx.stroke();
        this.circle(ctx, p1, 3.5);
        ctx.stroke();
      });
    }
  }
  calcBezier({x:startX, y:startY}, {x:endX, y:endY}) {
      const qx = (endX - startX) / 2;
      const qy = (endY - startY) / 2;
      if (startX < endX) {
      return [
        startX, startY,
        startX + qx, startY,
        endX - qx, endY,
        endX, endY
      ];
    } else {
      return [
        startX, startY,
        startX - qx, startY + qy*3/2,
        endX + qx, endY - qy*3/2,
        endX, endY
      ];
    }
  }
  roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.moveTo(x, y + radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.closePath();
  }
  circle(ctx, c, r) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
  }
  curve(ctx, path) {
    ctx.beginPath();
    // draw each line, the last line in each is always white
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.moveTo(path[0], path[1]);
    ctx.bezierCurveTo(path[2], path[3], path[4], path[5], path[6], path[7]);
    ctx.stroke();
    ctx.closePath();
  };
  laserCurve(ctx, path, highlight) {
    // lasers!!!!
    for (let i=3; i>=0; i--) {
      ctx.beginPath();
      // draw each line, the last line in each is always white
      ctx.lineWidth = i*2.2 + 1;
      ctx.strokeStyle = !i ? `rgba(${highlight[0]},${highlight[1]},${highlight[2]},1)` : `rgba(${highlight[0]},${highlight[1]},${highlight[2]},${0.25-0.06*i})`;
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
    position: absolute;
    min-width: 100px;
    min-height: 60px;
    /**/
    border-radius: 16px;
    border: 2px solid violet;
    background: purple;
    font-size: 11px;
    font-weight: bold;
    cursor: pointer;
  }
  [node] span {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  [node][selected] {
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
  [repeat="socket_i_t"] {
    margin-left: -10px;
    overflow: hidden;
  }
  [repeat="socket_o_t"] {
    margin-right: -10px;
    overflow: hidden;
  }
  [layer0] [dot] {
    transition: opacity 100ms ease-in-out;
    opacity: 0;
  }
  [layer0]:hover [dot] {
    opacity: 1;
  }
  [dot] {
    display: inline-block;
    width: 9px;
    height: 9px;
    background: white;
    border: 1px solid #33333380;
    border-radius: 50%;
    padding: 5px;
  }
  [bar] {
    padding: 3px;
  }
  [flex] {
    overflow: visible;
  }
</style>

<div layer0>
  <designer-layout
    selected="{{selectedKeys}}"
    on-update-box="onUpdateBox"
    on-delete="onNodeDelete"
    repeat="node_t">{{nodes}}</designer-layout>
</div>
<canvas layer1 width="2000" height="800"></canvas>

<template node_t>
  <div node flex column id="{{nodeId}}" key="{{key}}" selected$="{{selected}}" xen:style="{{style}}" on-mousedown="onNodeSelect">
    <div xen:style="{{nameStyle}}">
      <div style="text-align: center; padding: 4px;">{{displayName}}</div>
    </div>
    <div flex row>
      <div centering column repeat="socket_i_t">{{inputs}}</div>
      <div flex center row style="padding: 0 4px;"></div>
      <div centering column repeat="socket_o_t">{{outputs}}</div>
    </div>
  </div>
</template>

<template socket_i_t>
  <div bar title="{{title}}">
    <span dot></span>
    <span style="overflow: hidden; text-overflow: ellipsis; font-size: 8px; padding-left: 3px; text-align: left;">{{name}}</span>
  </div>
</template>

<template socket_o_t>
  <div bar title="{{title}}" style="justify-content: right;">
    <span style="overflow: hidden; text-overflow: ellipsis; font-size: 8px; padding-right: 3px; text-align: right;">{{name}}</span>
    <span dot></span>
  </div>
</template>

`;

customElements.define('node-graph', NodeGraph);
