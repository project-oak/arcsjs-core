/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Xen} from '../../Dom/Xen/xen-async.js';

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
  // TODO(mariakleiner): initialize node positions
  // update({graph}) {
  //   graph?.graphNodes.forEach(node => {
  //     const w = 140;
  //     const h = 60;
  //     const [w2, h2] = [w/2, h/2];
  //     this.rects[node.key] = {h, w, l: node.position.x-w2, y: node.position.y-h2};
  //   });
  // }
  _didMount() {
    this.canvas = this.querySelector('canvas');
    this.rects = {};
  }
  onNodeClick(event) {
    //event.stopPropagation();
    this.key = event.currentTarget.key;
    this.fire('node-selected');
  }
  onMouseDown(event) {
    //event.stopPropagation();
    this.key = event.currentTarget.key;
    this.fire('node-selected');
  }
  onMouseUp(event) {
    this.key = event.currentTarget.key;
    this.value = {x: event.clientX, y: event.clientY};
    this.fire('node-moved');
  }
  onDrop(event) {
    debugger;
    console.log('hello');
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
      const o = p(i);
      const [w, h, w2, h2] = [width, height, width/2, height/2];
      return {x: o.x, y: o.y, l: o.x-w2, t: o.y-h2, r: o.x+w2, b: o.y+w2, w, h, w2, h2};
    }
  }
  render({graph}, {x, y}) {
    const getEdgePath = ({x:startX, y:startY}, {x:endX, y:endY}) => {
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
    };
    const ctx = this.canvas?.getContext('2d');
    if (ctx) {
      // this.canvas.width = this.canvas.offsetWidth;
      // this.canvas.height = this.canvas.offsetHeight;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let scale = 1; //this.canvas.width / 2500;
      const curve = path => {
        path = path.map(v => v*scale);
        ctx.beginPath();
        ctx.moveTo(path[0], path[1]);
        ctx.bezierCurveTo(path[2], path[3], path[4], path[5], path[6], path[7]);
        ctx.stroke();
      };
      const circle = (c, r) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI*2);
        ctx.fill();
      };
      //const p = i => ({x: (i%cols)*width + margin + ox, y: Math.floor(i/cols)*height + margin + (margin*8)*(i%2) + oy});
      //const radius = 16;
      // graph?.graphNodes.map((n, i) => {
      graph?.graphEdges.map((edge, i) => {
        const i0 = graph.graphNodes.findIndex(({key}) => key === edge.from);
        const g0 = this.geom(edge.from, i0); //i); //n.key, i);
        ctx.strokeStyle = ['red', 'green', 'blue'][i%3];
        // this.roundedRect(ctx, g0.l, g0.t, g0.w, g0.h, radius);
        // ctx.fillStyle = n.bgColor;
        // ctx.fill();
        // ctx.strokeStyle = n.color;
        // ctx.stroke();
        //
        const i1 = graph.graphNodes.findIndex(({key}) => key === edge.to);
        const g1 = this.geom(edge.to, i1); //i+1);//graph.graphNodes[i+1]?.key, i+1);
        const p0 = {x: g0.r, y: g0.y};
        const p1 = {x: g1.l, y: g1.y};
        const path = getEdgePath(p0, p1);
        //
        ctx.strokeStyle = 'violet';
        curve(path);
        ctx.fillStyle = 'violet';
        ctx.strokeStyle = 'purple';
        circle(p0, 4);
        ctx.stroke();
        circle(p1, 4);
        ctx.stroke();
        ctx.fillStyle = edge.color; //n.color;
        ctx.font = '14px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText("n.displayName", g0.x + g0.width/2, p0.y, g0.width - 16);
      });
    }
    //console.log(graph);
    return {
      nodes: graph?.graphNodes.map((n, i) => {
        const g = this.geom(n.key, i);
        return {
          ...n,
          style: {
            borderColor: n.selected ? n.color : n.bgColor,
            // color: n.color,
            background: n.bgColor,
            transform: `translate(${g.l}px, ${g.t}px)`,
          }
        };
      })
    };
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
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    /**/
    position: absolute;
    /*
    top: 10px;
    left: 10px;
    */
    width: 140px;
    height: 60px;
    /**/
    border-radius: 32px;
    border: 3px solid violet;
    background: purple;
    padding: 4px 11px;
    /* color: white; */
    font-size: 13px;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
  }
  [node] > span {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  [node][selected] {
    border-radius: 50px;
    background: #e0e0e0;
    box-shadow:  23px 23px 46px #bebebe, -23px -23px 46px #ffffff;
  }
  [node]:not([selected]) {
    /* border-color: silver !important; */
    border-radius: 50px;
    background: #e0e0e0;
    box-shadow:  9px 9px 18px #cecece, -9px -9px 18px #f2f2f2;
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
</style>

<!-- <div layer0 on-drop="onDrop"> -->
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
  <div node key="{{key}}" selected$="{{selected}}" xen:style="{{style}}" on-click="onNodeClick" on-mousedown="onMouseDown" on-mouseup="onMouseUp"><span>{{displayName}}</span></div>
</template>

`;

customElements.define('node-graph', NodeGraph);
