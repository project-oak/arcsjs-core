/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

update({graph, ...layout}, state) {
  if (this.shouldRecomputeLayout(graph, state.graph)) {
    const outputs = {};
    state.graph = graph;
    keys(layout).forEach(id => {
      assign(outputs, {[id]: this.computeLayout(graph, graph.position?.[id])});
    });
    return outputs;
  }
},

shouldRecomputeLayout(graph, oldGraph) {
  if (graph) {
    // Graph changed.
    return (graph.$meta.id !== oldGraph?.$meta?.id)
      // A node was removed.
      || (keys(oldGraph?.nodes).some(key => !graph.nodes[key]))
      ;
  }
},

computeLayout({$meta: {id}, nodes}, positions) {
  const layout = {id};
  entries(positions).forEach(([id, position]) => {
    if (nodes[id]) {
      layout[id] = position;
    }
    // Consider also deleting positions of non existent nodes?
  });
  return layout;
}

});