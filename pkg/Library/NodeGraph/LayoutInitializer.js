/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

({
update({pipeline}, state) {
  const outputs = {};
  if (this.pipelineChanged(pipeline, state.pipeline)) {
    keys(pipeline.position).forEach(key => {
      assign(outputs, {[key]: this.computeLayout(pipeline, pipeline.position[key])});
    });
  }
  return outputs;
},

pipelineChanged(pipeline, oldPipeline) {
  return pipeline.$meta.id !== oldPipeline?.$meta?.id
    || keys(pipeline.nodes).length !== keys(oldPipeline?.nodes).length;
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