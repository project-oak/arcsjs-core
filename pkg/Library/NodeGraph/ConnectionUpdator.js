/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

update({pipeline, nodeTypes, candidates}, state) {
  if (pipeline && this.pipelineChanged(pipeline, state.pipeline)) {
    state.pipeline = pipeline;
    if (this.updatePipelineConnections(pipeline, nodeTypes, candidates)) {
      return {pipeline};
    }
  }
},

pipelineChanged(pipeline, oldPipeline) {
  return pipeline.id !== oldPipeline?.id || 
         pipeline.nodes?.length !== oldPipeline?.nodes?.length;
},

updatePipelineConnections(pipeline, nodeTypes, candidates) {
  return pipeline.nodes
    .map(node => this.updateNodeConnections(node, nodeTypes[node.type], candidates[node.key]))
    .some(changed => changed);
},

updateNodeConnections(node, nodeType, candidates) {
  if (this.shouldUpdateConnections(node) && candidates) {      
    keys(nodeType.$stores).forEach(store => {
      node.connections = {};
      this.updateStoreConnection(node, store, candidates[store])
    });
    return true;
  }
  return false;
},

shouldUpdateConnections(node) {
  return !node.connections;
},

updateStoreConnection(node, store, candidates) {
  if (candidates?.length === 1) {
    node.connections = node.connections || {};
    node.connections[store] = [...candidates];
    return true;
  }
}

});