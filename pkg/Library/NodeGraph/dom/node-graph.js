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
      const circle = (c, r) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI*2);
        ctx.fill();
      };
      //const p = i => ({x: (i%cols)*width + margin + ox, y: Math.floor(i/cols)*height + margin + (margin*8)*(i%2) + oy});
      //const radius = 16;
      graph?.graphNodes.map((n, i) => {
        const g0 = this.geom(n.key, i);
        ctx.strokeStyle = ['red', 'green', 'blue'][i%3];
        // this.roundedRect(ctx, g0.l, g0.t, g0.w, g0.h, radius);
        // ctx.fillStyle = n.bgColor;
        // ctx.fill();
        // ctx.strokeStyle = n.color;
        // ctx.stroke();
        //
        const g1 = this.geom(null, i+1)
        const p0 = {x: g0.r, y: g0.y};
        const p1 = {x: g1.l, y: g1.y};
        const path = getEdgePath(p0, p1);
        //
        ctx.strokeStyle = 'violet';
        this.curve(ctx, path);
        ctx.fillStyle = 'violet';
        ctx.strokeStyle = 'purple';
        circle(p0, 4);
        ctx.stroke();
        circle(p1, 4);
        ctx.stroke();
        // ctx.fillStyle = 'silver'; //n.color;
        // ctx.font = '14px sans-serif';
        // ctx.textBaseline = 'middle';
        // ctx.textAlign = 'center';
        // ctx.fillText(n.displayName, g0.x + g0.width/2, p0.y, g0.width - 16);
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
            color: n.selected ? 'white' : 'gray',
            background: n.bgColor,
            transform: `translate(${g.l}px, ${g.t}px)`,
          }
        };
      })
    };
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
  curve(ctx, path) {
    //path = path.map(v => v*scale);
    // ctx.beginPath();
    // ctx.moveTo(path[0], path[1]);
    // ctx.bezierCurveTo(path[2], path[3], path[4], path[5], path[6], path[7]);
    // ctx.stroke();
    const ir = r => Math.round(Math.random() * r);
    //const highlight = [ir(255), ir(255), ir(255)];
    const highlight = [255, 0, 255];

    for (let i=5; i>=0; i--) {
      ctx.beginPath();
      // draw each line, the last line in each is always white
      ctx.lineWidth = (i+1)*4-3;
      ctx.strokeStyle = !i ? '#fff' : `rgba(${highlight[0]},${highlight[1]},${highlight[2]},${0.1-0.01*i})`;
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
    box-shadow:  23px 23px 46px #bebebe88, -23px -23px 46px #ffffff88;
  }
  [node]:not([selected]) {
    /* border-color: silver !important; */
    border-radius: 50px;
    background: #e0e0e0;
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
    background: black;
  }
  [layer1] {
    position: absolute;
    pointer-events: none;
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
  <div node key="{{key}}" selected$="{{selected}}" xen:style="{{style}}" on-mousedown="onNodeSelect"><span>{{displayName}}</span></div>
</template>

`;

customElements.define('node-graph', NodeGraph);
