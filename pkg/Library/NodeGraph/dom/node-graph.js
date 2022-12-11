/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Xen} from '../../Dom/Xen/xen-async.js';

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
  get idPrefix() {
    return '';
  }
  _didMount() {
    this.canvas = this.querySelector('canvas');
    this._rects = {};
  }
  render(inputs, state) {
    // iterate graph nodes to find selection and ensure each rect exists
    let selected = this.validateGraphRects(inputs);
    console.log(inputs.rects);
    // compute selectedKeys
    const selectedKeys = selected?.key ? [`${this.idPrefix}${selected.key}`] : null
    // covert rects into render model objects
    const rects = this.renderRects(inputs);
    console.log(rects);
    // compute array of graphNodes to render
    const nodes = this.renderGraph(inputs);
    // NB: connectors are drawn after, via Canvas. See _didRender.
    state.didRender = {rects: inputs.rects, graph: inputs.graph};
    // complete render model
    return {selectedKeys, rects, nodes};
  }
  validateGraphRects(inputs) {
    inputs.rects = inputs.rects ?? this._rects;
    const {rects, graph} = inputs;
    // iterate graph nodes
    let selected = null;
    if (graph) {
      const nodes = [...graph.graphNodes].sort((a,b) => a.key?.localeCompare(b.key));
      nodes.forEach((n, i) => {
        // - calculate missing rect
        if (!rects[n.key]) {
          const {l, t, w, h} = this.geom(rects, n.key, i, n);
          rects[n.key] = {l, t, w, h};
        }
        // - memoize selected node
        if (n.selected) {
          selected = n;
        }
      });
    }
    return selected;
  }
  // get the geometry information for rectangle `key` (with index i)
  geom(rects, key, i, node) {
    if (rects?.[key]) {
      const {l, t, w, h} = rects[key];
      const [w2, h2] = [w/2, h/2];
      return {x: l+w2, y: t+h2, l, t, r: l+w, b: t+h, w, h, w2, h2};
    } else {
      // calculate a default landing spot
      let [width, height] = [140, 60];
      if (node) {
        height = Math.max(node?.inputs.length, node?.outputs.length) * 26;
      }
      const [cols, margin, ox, oy] = [3, 50, 116, 116];
      const p = i => ({
        x: (i%cols)*(width+margin) + ox,
        y: Math.floor(i/cols)*(128+margin) + 16*(i%2) + oy
      });
      const o = p(i); // % 3);
      const [w, h, w2, h2] = [width, height, width/2, height/2];
      return {x: o.x, y: o.y, l: o.x-w2, t: o.y-h2, r: o.x+w2, b: o.y+w2, w, h, w2, h2};
    }
  }
  renderRects({rects}) {
    return Object.entries(rects || []).map(([id, position]) => ({id, position}));
  }
  renderGraph({rects, graph}) {
    // compute array of graphNodes to render
    const renderNodes = (rects && graph?.graphNodes) ?? [];
    return renderNodes.map(n => this.renderGraphNode(n));
  }
  renderGraphNode({key, selected, color, bgColor, inputs, outputs, textSelected, ...etc}) {
    return {
      ...etc,
      key,
      selected,
      nodeId: `${this.idPrefix}${key}`,
      inputs: inputs?.map(({name, type}) => ({name, type, title: `${name}: ${type}`})),
      outputs: outputs?.map(({name, type}) => ({name, type, title: `${name}: ${type}`})),
      nameStyle: {
        borderRadius: '11px 11px 0 0',
        borderColor: selected ? color : bgColor,
        background: selected ? color : bgColor,
      },
      style: {
        borderColor: selected ? color : bgColor,
        color: selected ? 'white' : 'gray',
        background: bgColor
      },
      inputStyle: {
        background: 'transparent',
        borderColor: 'transparent',
        borderRadius: '11px 11px 0 0',
        color: selected ? 'white' : 'black',
        textAlign: 'center',
        width: '100%'
      },
      disableRename: Boolean(!textSelected && (key !== this.state.textSelectedKey))
    };
  }
  _didRender({}, {x, y, didRender: {graph, rects}}) {
    if (rects) {
      this.renderCanvas({graph, rects}, {x, y});
    }
  }
  renderCanvas({graph, rects}, {x, y}) {
    const ctx = this.canvas?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      //console.log('=');
      rects && graph?.graphEdges.map((edge, i) => {
        const spacing = 18;
        const margin = 11;
        //
        const i0 = graph.graphNodes.findIndex(({key}) => key === edge.from.id);
        const i0outs = graph.graphNodes[i0]?.outputs;
        const ii0 = i0outs?.findIndex(({name}) => name === edge.from.storeName);
        const ii0c =i0outs?.length / 2 - 0.5;
        //console.log('out', i0, ii0, ii0c, edge.from.storeName);
        const i0offset = spacing * (ii0-ii0c) + margin;
        const g0 = this.geom(rects, edge.from.id, i0);
        //
        const i1 = graph.graphNodes.findIndex(({key}) => key === edge.to.id);
        const i1ins = graph.graphNodes[i1]?.inputs;
        const ii1 = i1ins?.findIndex(({name}) => name === edge.to.storeName);
        const ii1c = i1ins?.length / 2 - 0.5;
        //console.log('in', i1, ii1, ii1c, edge.to.storeName);
        const i1offset = spacing * (ii1-ii1c) + margin;
        const g1 = this.geom(rects, edge.to.id, i1);
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
        ctx.strokeStyle = 'blue';
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
  }
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
  }

  onNodeSelect(event) {
    this.key = event.currentTarget.key;
    if (this.key !== this.state.textSelectedKey) {
      delete this.state.textSelectedKey;
    }
    this.fire('node-selected');
  }

  // called when user has changed a rectangle (high freq)
  onUpdateBox({currentTarget: {value: rect}}) {
    this.value = rect;
    this.rects[this.key] = rect;
    this.invalidate();
  }

  // called when committed a change to a rectangle (low freq)
  onUpdatePosition({currentTarget: {value: rect}}) {
    this.fire('node-moved');
  }

  onNodeDblClicked(event) {
    this.state.textSelectedKey = this.key;
  }

  // selectNodeName(event) {
  //   const txtNode = event.currentTarget.childNodes[1];
  //   if (txtNode) {
  //     const range = document.createRange();
  //     range.selectNodeContents(txtNode);
  //     const sel = window.getSelection();
  //     sel.removeAllRanges();
  //     sel.addRange(range);
  //   }
  // }

  onRenameNode(event){
    const text = event.target.value.trim();
    if (text?.length > 0) {
      this.value = text;
      this.fire('node-renamed');
    }
    delete this.state.textSelectedKey;
  }
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
    opacity: 0.9;
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
  [layer0] [repeat] {
    color: silver;
  }
  [layer0]:hover [repeat] {
    color: gray;
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

<canvas layer1 width="2000" height="800"></canvas>
<div layer0>
  <designer-layout
    rects="{{rects}}"
    selected="{{selectedKeys}}"
    on-position="onUpdatePosition"
    on-update-box="onUpdateBox"
    on-delete="onNodeDelete"
    repeat="node_t">{{nodes}}</designer-layout>
</div>

<template node_t>
  <div node flex column id="{{nodeId}}" key="{{key}}" selected$="{{selected}}" xen:style="{{style}}" on-mousedown="onNodeSelect">
    <div xen:style="{{nameStyle}}" on-dblclick="onNodeDblClicked">
      <input xen:style="{{inputStyle}}" disabled$="{{disableRename}}" type="text" value="{{displayName}}" on-change="onRenameNode">
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
