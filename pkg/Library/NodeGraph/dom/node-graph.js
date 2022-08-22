/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../Dom/Xen/xen-async.js';
import {d3} from './d3-import.js';

const template = Xen.Template.html`
<style>
  svg {
    height: 95%;
  }
</style>
`;

export class NodeGraph extends Xen.Async {
  static get observedAttributes() {
    return ['nodes'];
  }
  get template() {
    return template;
  }
  get container() {
    return this._dom.root;
  }
  update({nodes}, state) {
    state.svg = nodes && renderNodeGraph(nodes, this.onSelectClick.bind(this), this.onDeleteClick.bind(this));
  }
  render({}, {svg}) {
    const old = this.host.querySelector('svg');
    old?.remove();
    if (svg) {
      this.host.appendChild(svg);
    }
  }
  onSelectClick(event,  {data: {key}}) {
    this.key = key;
    this.fire('select');
    event.stopPropagation();
  }
  onDeleteClick(event, {data: {key}}) {
    this.key = key;
    this.fire('delete');
    event.stopPropagation();
  }
}
customElements.define('node-graph', NodeGraph);

export const renderNodeGraph = (nodes, selectHandler, deleteHandler) => {
  const svg = Tree(nodes, {
    padding: 0,
    label: d => d.name,
    selectHandler,
    deleteHandler
  });
  return svg;
};

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/tree

const Tree = (data, { // data is either tabular (array of objects) or hierarchy (nested objects)
  path, // as an alternative to id and parentId, returns an array identifier, imputing internal nodes
  id = Array.isArray(data) ? d => d.id : null, // if tabular data, given a d in data, returns a unique identifier (string)
  parentId = Array.isArray(data) ? d => d.parentId : null, // if tabular data, given a node d, returns its parent’s identifier
  children, // if hierarchical data, given a d in data, returns its children
  tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
  sort, // how to sort nodes prior to layout (e.g., (a, b) => d3.descending(a.height, b.height))
  label, // given a node d, returns the display name
  title, // given a node d, returns its hover text
  link, // given a node d, its link (if any)
  linkTarget = "_blank", // the target attribute for links (if any)
  width, // outer width, in pixels
  height, // outer height, in pixels
  r = 3, // radius of nodes
  padding = 1, // horizontal padding for first and last column
  fill = "#999", // fill for nodes
  fillOpacity, // fill opacity for nodes
  stroke = "#555", // stroke for links
  strokeWidth = 1.5, // stroke width for links
  strokeOpacity = 0.4, // stroke opacity for links
  strokeLinejoin, // stroke line join for links
  strokeLinecap, // stroke line cap for links
  halo = "#fff", // color of label halo
  haloWidth = 0, // padding around the labels
  selectHandler,
  deleteHandler
} = {}) => {
  // If id and parentId options are specified, or the path option, use d3.stratify
  // to convert tabular data to a hierarchy; otherwise we assume that the data is
  // specified as an object {children} with nested objects (a.k.a. the “flare.json”
  // format), and use d3.hierarchy.
  const root = path != null ? d3.stratify().path(path)(data)
      : id != null || parentId != null ? d3.stratify().id(id).parentId(parentId)(data)
      : d3.hierarchy(data, children);
  //
  // Compute labels and titles.
  const descendants = root.descendants();
  const L = label == null ? null : descendants.map(d => label(d.data, d));
  //
  // Sort the nodes.
  if (sort != null) root.sort(sort);
  //
  const nodeWidth = 164;
  const nodeHeight = 48;
  const nodeMarginY = 32;
  const nodeMarginX = 64;
  //
  // Compute the layout.
  const dx = nodeWidth + nodeMarginX;
  const dy = nodeHeight + nodeMarginY;
  // works out some sizing stuff?
  tree().nodeSize([dy, dx])(root);
  //
  // Center the tree.
  let y0 = Infinity;
  let y1 = -y0;
  root.each(d => {
    // d is rotated 90 degrees
    if (d.x > y1) y1 = d.x;
    if (d.x < y0) y0 = d.x;
  });
  const cy = nodeHeight / 2;
  y0 -= cy;
  y1 += cy;
  //
  // Compute sizes.
  if (height === undefined) height = y1 - y0;
  width = dx * root.height;
  //
  const [markerBoxWidth, markerBoxHeight] = [6, 6];
  const [markerCx, markerCy] = [markerBoxWidth / 2, markerBoxHeight / 2];
  const arrowPoints = [[0, 0], [0, markerBoxWidth], [markerBoxWidth, markerCy]];
  //
  // output svg
  const svg = d3.create("svg");
  svg
    .attr("viewBox", [dx - 16, y0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("font-size", 14)
    ;
  // marker defs
  const defs = svg.append('defs');
  defs.append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
    .attr('refX', markerCx)
    .attr('refY', markerCy)
    .attr('markerWidth', markerBoxWidth)
    .attr('markerHeight', markerBoxHeight)
    .attr('orient', 'auto-start-reverse')
    .append('path')
      .attr('d', d3.line()(arrowPoints))
      .attr('stroke', 'black')
    ;
  defs.append('marker')
    .attr('id', 'dot')
    .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
    .attr('refX', markerCx)
    .attr('refY', markerCy)
    .attr('markerWidth', markerBoxWidth)
    .attr('markerHeight', markerBoxHeight)
    .attr('orient', 'auto-start-reverse')
    .append('circle')
      //.attr('stroke', 'green')
      //.attr('stroke-width', 2)
      .attr('fill', '#333')
      //.attr('fill', 'red')
      .attr('cx', markerCx)
      .attr('cy', markerCy)
      .attr('r', markerCy)
    ;
  // grouped details
  const node = svg.append("g")
    .selectAll("a")
    .data(root.descendants())
    .join("a")
      .on("click", (event, d) => selectHandler(event, d))
      .attr("display", d => d.depth === 0 ? 'none' : '')
      .attr("link:href", link == null ? null : d => link(d.data, d))
      .attr("target", link == null ? null : linkTarget)
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .attr("cursor", "pointer")
      ;
  node.append("rect")
    .attr("stroke", d => d.data.color || "silver")
    .attr("stroke-width", d => d.data.strokeWidth || strokeWidth)
    .attr("fill", d => d.data.bgColor || "#F0F0FF")
    .attr("width", nodeWidth)
    .attr("height", nodeHeight)
    .attr("y", -nodeHeight/2)
    .attr("rx", 8)
    .attr("ry", 8)
    ;
  node.append("text")
    .on("click", (event, d) => deleteHandler(event, d))
    .attr("dx", `${nodeWidth - 8}px`)
    .attr("dy", `0.5em`)
    .attr("text-anchor", "end")
    .attr("font-family", "Material Icons")
    .attr("font-size", 18)
    .attr("cursor", "pointer")
    .text("delete")
    ;
  if (title) {
    node.append("title").text(d => title(d.data, d));
  }
  if (L) {
    node.append("text")
      .attr("dx", "0.64em")
      .attr("dy", "0.32em")
      .text((d, i) => L[i])
      .call(text => text.clone(true))
        .attr("fill", "none")
        .attr("stroke", halo)
        .attr("stroke-width", haloWidth)
      ;
  }
  // connectors
  svg.append("g")
      .attr("fill", "none")
      .attr("stroke", stroke)
      .attr("stroke-opacity", strokeOpacity)
      .attr("stroke-linecap", strokeLinecap)
      .attr("stroke-linejoin", strokeLinejoin)
      .attr("stroke-width", strokeWidth)
    .selectAll("path")
      .data(root.links())
      .join("path")
        .attr("display", d => d.source.depth === 0 ? 'none' : null)
        .attr("d", d3.linkHorizontal()
          .source(({source: {x, y}}) => ({x: x, y: y + nodeWidth}))
          .target(({target: {x, y}}) => ({x: x, y: y - markerBoxWidth}))
          .x(d => d.y)
          .y(d => d.x)
        )
        .attr('marker-start', 'url(#dot)')
        .attr('marker-end', 'url(#arrow)')
        ;
  return svg.node();
};
