/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

({
update({pipeline, ...layout}, state) {
  if (this.shouldRecomputeLayout(pipeline, state.pipeline)) {
    const outputs = {};
    state.pipeline = pipeline;
    keys(layout).forEach(id => {
      assign(outputs, {[id]: this.computeLayout(pipeline, pipeline.position?.[id])});
    });
    return outputs;
  }
},

shouldRecomputeLayout(pipeline, oldPipeline) {
  if (pipeline) {
    // Pipeline changed.
    return (pipeline.$meta.id !== oldPipeline?.$meta?.id)
      // A node was removed.
      || (keys(oldPipeline.nodes).some(key => !pipeline.nodes[key]))
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