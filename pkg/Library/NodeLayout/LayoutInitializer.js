/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

update({graph}, state) {
  if (this.graphChanged(graph, state.graph)) {
    state.graph = graph;
    return graph.position;
    //return this.outputLayouts(graph);
  }
},

graphChanged(graph, oldGraph) {
  if (graph) {
    // Graph changed.
    return (graph.$meta.id !== oldGraph?.$meta?.id)
      // A node was removed.
      || (keys(oldGraph?.nodes).some(key => !graph.nodes[key]))
      ;
  }
},

// outputLayouts(graph) {
//   const layouts = {};
//   // graph.position maps layouts by id
//   keys(graph.position).forEach(layoutId => {
//     // if there is position data for this layout
//     const layout = graph.position?.[layoutId];
//     // add it to the set
//     assign(layouts, {[layoutId]: layout});
//     //assign(outputs, {[layoutId]: this.computeLayout(graph, graph.position?.[id])});
//   });
//   return layouts;
// },

// computeLayout({$meta: {id}, nodes}, positions) {
//   const layout = {id};
//   entries(positions).forEach(([id, position]) => {
//     if (nodes[id]) {
//       layout[id] = position;
//       // note sure what this is for
//       //const containerId = `${id}:Container`;
//       // make the layout.containerId == positions.containerId
//       //layout[containerId] = positions[containerId];
//     }
//     // Consider also deleting positions of non existent nodes?
//   });
//   return layout;
// }

});