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
  }
  onNodeClick(event) {
    //event.stopPropagation();
    this.key = event.currentTarget.key;
    this.fire('node-selected');
  }
  geom(i) {
    const [width, height, cols, margin, ox, oy] = [140, 60, 8, 50, 100, 128];
    const p = i => ({
      x: (i%cols)*(width+margin) + ox,
      y: Math.floor(i/cols)*(height+margin) + margin*(i%2) + oy
    });
    const o = p(i);
    const [w, h, w2, h2] = [width, height, width/2, height/2];
    return {x: o.x, y: o.y, l: o.x-w2, t: o.y-h2, r: o.x+w2, b: o.y+w2, w, h, w2, h2};
    //return {x: o.x - width/2, y: o.y - height/2, width, height};
  }
  render({graph}, {x, y}) {
    const getEdgePath = ({x:startX, y:startY}, {x:endX, y:endY}) => {
      return [
        startX, startY,
        startX + (endX - startX) / 2, startY,
        endX - (endX - startX) / 2, endY,
        endX, endY
      ];
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
      const radius = 16;
      graph?.graphNodes.map((n, i) => {
        const g0 = this.geom(i);
        ctx.strokeStyle = ['red', 'green', 'blue'][i%3];
        // this.roundedRect(ctx, g0.l, g0.t, g0.w, g0.h, radius);
        // ctx.fillStyle = n.bgColor;
        // ctx.fill();
        // ctx.strokeStyle = n.color;
        // ctx.stroke();
        //
        const g1 = this.geom(i+1)
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
        ctx.fillStyle = n.color;
        ctx.font = '14px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(n.displayName, g0.x + g0.width/2, p0.y, g0.width - 16);
      });
    }
    //console.log(graph);
    return {
      nodes: graph?.graphNodes.map((n, i) => {
        const g = this.geom(i);
        return {
          ...n,
          style: {
            borderColor: n.selected ? n.color : n.bgColor,
            color: n.color,
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
    position: relative;
    inset: 0;
  }
  [layer1] {
    position: absolute;
    pointer-events: none;
  }
</style>

<div layer0 repeat="node_t">{{nodes}}</div>
<canvas layer1 width="2000" height="800"></canvas>

<template node_t>
  <div node key="{{key}}" selected$="{{selected}}" xen:style="{{style}}" on-click="onNodeClick"><span>{{displayName}}</span></div>
</template>

<!-- <svg width="200" height="250" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <g repeat="node_t">
    <rect x="10" y="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>
  </g>
</svg> -->

<!-- <template node_t>
  <rect x="10" y="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>
</template>

<template node_t2>
  <g node key="{{key}}" selected$="{{selected}}" center row xen:style="{{style}}" on-click="onNodeClick">
    <rect x="10" y="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>
  </g>
</template> -->
`;

customElements.define('node-graph', NodeGraph);
