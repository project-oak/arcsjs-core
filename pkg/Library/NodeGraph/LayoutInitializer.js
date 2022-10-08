/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

({
update({pipeline, ...inputs}, state) {
  const outputs = {};
  if (pipeline && this.shouldRecomputeLayout(pipeline, state.pipeline)) {
    state.pipeline = pipeline;
    keys(inputs).forEach(key => {
      assign(outputs, {[key]: this.computeLayout(pipeline, pipeline.position?.[key])});
    });
  }
  return outputs;
},

shouldRecomputeLayout(pipeline, oldPipeline) {
  // Pipeline changed.
  if (pipeline.$meta.id !== oldPipeline?.$meta?.id) {
    return true;
  }
  // A node was removed.
  if (keys(oldPipeline.nodes).some(key => !pipeline.nodes[key])) {
    return true;
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