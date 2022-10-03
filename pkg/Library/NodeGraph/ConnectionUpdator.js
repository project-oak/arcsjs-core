/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

// ConnectionUpdator atm only initializes connections of newly added nodes,
// if a single candidate is available.
// In the future, a more sophisticated heuristics can be implemented to
// automatically connect nodes.

update(inputs, state) {
  if (this.inputsChanged(inputs, state)) {
    const {pipeline, nodeTypes, candidates} = inputs;
    assign(state, {pipeline, candidates});
    let changed = false;
    if (this.removePipelineOutdatedConnections(pipeline, candidates)) {
      changed = true;
    }
    if (this.updatePipelineConnections(pipeline, nodeTypes, candidates)) {
      changed = true;
    }
    return {pipeline};
  }
},

inputsChanged({pipeline, candidates}, state) {
  return pipeline && 
      (this.pipelineChanged(pipeline, state.pipeline) || this.candidatesChanged(candidates, state.candidates))
},

pipelineChanged(pipeline, oldPipeline) {
  return pipeline.id !== oldPipeline?.id ||
         keys(pipeline.nodes).length !== keys(oldPipeline?.nodes).length;
},

candidatesChanged(candidates, oldCandidates) {
  return !deepEqual(candidates, oldCandidates);
},

removePipelineOutdatedConnections(pipeline, candidates) {
  return values(pipeline.nodes)
    .map(node => this.removeNodeOutdatedConnections(node, candidates[node.key]))
    .some(changed => changed);
},

removeNodeOutdatedConnections(node, candidates) {
  let changed = false;
  keys(node.connections).forEach(key => {
    const conns = node.connections[key];
    node.connections[key] = conns.filter(conn => this.hasMatchingCandidate(conn, candidates[key]));
    if (node.connections[key].length === 0) {
      delete node.connections[key];
    }
    changed = changed || (node.connections[key]?.length === values.length);
  });
  return changed;
},

hasMatchingCandidate(connection, candidates) {
  return candidates.some(({from, storeName}) => from === connection.from && storeName === connection.storeName);
},

updatePipelineConnections(pipeline, nodeTypes, candidates) {
  return values(pipeline.nodes)
    .map(node => this.updateNodeConnections(node, nodeTypes[node.type], candidates[node.key]))
    .some(changed => changed);
},

updateNodeConnections(node, nodeType, candidates) {
  if (this.shouldUpdateConnections(node) && candidates) {      
    keys(nodeType.$stores).forEach(store => {
      node.connections ??= {};
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
    node.connections[store] = [...candidates];
    return true;
  }
}

});
