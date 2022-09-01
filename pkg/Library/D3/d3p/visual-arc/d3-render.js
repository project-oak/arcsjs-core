/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {d3} from '../../d3.js';

const color = d => {
  return d3.schemeCategory10[(d?.group || d?.data?.group || 0) * 2 + 0];
};

// const glyph = d => {
//   return `./Library/Dom/d3p/visual-arc/assets/${[
//     "arc.png",
//     "particle.png",
//     "store.png",
//     "slot.png"
//   ][d.group || d.data?.group || 0]}`;
// };

// for each node it visits
const addGroupMarks = node => {
  // const clicked = function(event, d) {
  //   //if (event.defaultPrevented) return; // dragged
  //   d3.select(this).transition(400)
  //     .attr("opacity", 1)
  //     .attr("fill", "red")
  //     ;
  // };
  // add a circle
  node
    .append("circle")
    .attr("r", 4.5)
    .attr("fill", color)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("opacity", "1.0")
    //.attr("opacity", d => d.hi ? "1.0" : "0.1")
    //.on("click", clicked)
    // .attr("fill", "#888")
    // .attr("stroke", color)
    // .attr("stroke-width", 1.2)
  ;
  // add a glyph
  // node.append("image")
  //   .attr("x", -5)
  //   .attr("y", -5)
  //   .attr("width", 10)
  //   .attr("height", 10)
  //   .attr("href", glyph)
  // ;
  // add a label
  node.append("text")
    // bottom layer (matte)
    .attr("font-size", 6)
    .attr("stroke", "#333")
    .attr("stroke-width", 1.5)
    .attr("transform", "translate(0 8)")
    .attr("text-anchor", "middle")
    //.text(d => (d.hi || d.group != 2) ? d.name || d.data?.name : '')
    .text(d => d.name || d.data?.name)
    // second layer (text)
    .clone(true)
    .attr("font-size", 6)
    .attr("fill", "#f1f1f1")
    //.attr("opacity", d => d.hi ? "1.0" : "0.3")
    .attr("opacity", "1.0")
    .attr("stroke-width", 0)
  ;
  node.on("click", (event, d) => d?.onclick(d));
};

// create a root SVG node
const makeRootSvg = (width, height) => {
  return d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("font", "10px sans-serif")
    ;
};

export const renderForceGraph = (data, width, height) => {
  // center of mass
  const [cx, cy] = [width / 2, height / 2];
  // create mutable data
  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));
  // create a force simulation
  const simulation = d3.forceSimulation(nodes)
    .alphaDecay(0.1)
    // make link forces that bind nodes together
    .force("link", d3.forceLink(links)
      .id(d => d.id)
      .strength(d => d.strength)
    )
    // make a radial force to push nodes outwards based on group
    .force("radial", d3.forceRadial(500, cx, cy)
      .radius(d => [0, 30, 10][d.group] || 0)
    )
    // make a charge force so nodes repel each other
    .force("charge", d3.forceManyBody())
    // drive the whole system to the center of mass
    .force("center", d3.forceCenter(cx, cy))
    ;
  // when simulation is recalculated, apply the results
  simulation.on("tick", () => {
    // set the link stroke coords to the sim coords
    link
      //.attr("opacity", d => d.hi ? 1 : 0.5)
      .attr("opacity", 1)
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
      ;
    // set the node transform coords to the sim coords
    node
      .attr("transform", d => `translate(${d.x ?? 0}, ${d.y ?? 0})`)
      ;
  });
  // make a root SVG node
  const svg = makeRootSvg(width, height);
  // create a top group
  const topG = svg.append("g");
  // applies transform to topG
  const zoomed = ({transform}) => {
    topG.attr("transform", transform);
  };
  // attach a zoom controller to svg
  svg.call(d3.zoom()
    // set boundaries
    .extent([[0, 0], [width, height]])
    .scaleExtent([0.1, 8])
    // attach zoom handler
    .on("zoom", zoomed))
    ;
  // link node gets all the link lines
  const link = topG.append("g")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
      // .attr("stroke", d => d.hi ? "#eee" : "#555")
      .attr("stroke",
        //'#eee'
        // TODO(sjmiles): this function should come flying in from outside
        d => d.input ? 'green' : 'red'
      )
      .attr("stroke-width",
        //"0.4"
        d => d.input ? '0.6' : '0.2'
      )
    ;
  // node node gets all the node points
  const node = topG.append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    // if we drag a node, run the simulation again
    //.call(drag(simulation))
    ;
  // whut???
  addGroupMarks(node);
  // run the simulatron
  simulation.alpha(4).restart();
  // here's Johnny
  return svg.node();
};

// export const renderTreeGraph = (data, width, height) => {
//   const root = d3.hierarchy(data.root);
//   //console.log(root);
//   //
//   const tree = d3.tree().nodeSize([20, 70])(root);
//   tree.dx = 5;
//   tree.dy = 150; //width / (root.height + 1);
//   //
//   // TODO(sjmiles): doesn't `scale` do this kind of thing?
//   let x0 = Infinity;
//   let x1 = -x0;
//   tree.each(d => {
//     if (d.x > x1) x1 = d.x;
//     if (d.x < x0) x0 = d.x;
//   });
//   //
//   const svg = makeRootSvg(width, height); //x1 - x0 + tree.dx * 2])
//   //
//   svg.call(d3.zoom()
//     .extent([[0, 0], [width, height]])
//     .scaleExtent([0.1, 10])
//     .on("zoom", zoomed))
//     ;
//   //
//   const topG = svg.append("g");
//   function zoomed({transform}) {
//     topG.attr("transform", transform);
//   }
//   //
//   const g = topG
//     .append("g")
//     .attr("transform", `translate(-80, 150)`)
//     //.attr("transform", `translate(${tree.dy / 3},${tree.dx - x0})`)
//     ;
//   //
//   const link = g.append("g")
//       .attr("fill", "none")
//       .attr("stroke", "#555")
//       .attr("stroke-opacity", 0.4)
//       .attr("stroke-width", 1.5)
//     .selectAll("path")
//       .data(tree.links())
//       .join("path")
//         .attr("d", d3.linkHorizontal()
//           .x(d => d.y)
//           .y(d => d.x)
//         )
//       ;
//   //
//   const node = g.append("g")
//       .attr("stroke-linejoin", "round")
//       .attr("stroke-width", 3)
//     .selectAll("g")
//     .data(tree.descendants())
//     .join("g")
//       .attr("transform", d => `translate(${d.y ?? 0},${d.x ?? 0})`)
//     ;
//   //
//   addGroupMarks(node);
//   //
//   return svg.node();
// };

// const drag = simulation => {
//   function dragstarted(event) {
//     if (!event.active) simulation.alphaTarget(0.1).restart();
//     event.subject.fx = event.subject.x;
//     event.subject.fy = event.subject.y;
//   }
//   function dragged(event) {
//     event.subject.fx = event.x;
//     event.subject.fy = event.y;
//   }
//   function dragended(event) {
//     if (!event.active) simulation.alphaTarget(0);
//     event.subject.fx = null;
//     event.subject.fy = null;
//   }
//   return d3
//     .drag()
//     .on("start", dragstarted)
//     .on("drag", dragged)
//     .on("end", dragended)
//   ;
// };
