/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

async update({pipeline, nodeTypes, globalStores}, state) {
  if (this.pipelineChanged(pipeline, state.pipeline) ||
      this.nodesChanged(pipeline?.nodes, state.nodes)) {
    state.pipeline = pipeline;
    state.nodes = pipeline?.nodes;
    return {
      candidates: this.findCandidates(pipeline, nodeTypes, globalStores)
    };
  }
},

pipelineChanged(pipeline, oldPipeline) {
  return this.pipelineId(pipeline) !== this.pipelineId(oldPipeline);
},

pipelineId(pipeline) {
  // Backward compatibility for pipelines published in versions < 0.4
  return pipeline?.$meta?.id || pipeline?.$meta?.name;
},

nodesChanged(nodes, currentNodes) {
  if (nodes?.length === currentNodes?.length) {
    return !currentNodes?.every((node, index) => deepEqual(node, currentNodes[index]));
  }
  return true;
},

findCandidates(pipeline, nodeTypes, globalStores) {
  const candidates = {};
  pipeline?.nodes.forEach(node => {
    candidates[node.key] = this.findNodeCandidates(node, pipeline, nodeTypes, globalStores);
  });
  return candidates;
},

findNodeCandidates(node, pipeline, nodeTypes, globalStores) {
  const candidates = {};
  entries(nodeTypes[node.type]?.$stores).forEach(([storeName, store]) => {
    if (store.connection) {
      candidates[storeName] =
        this.findConnectionCandidates(storeName, store, node, pipeline, nodeTypes, globalStores);
    }
  });
  return candidates;
},
findConnectionCandidates(storeName, {$type}, node, {nodes}, nodeTypes, globalStores) {
  const candidates = [];
  candidates.push(this.findGlobalCandidate(storeName, globalStores));
  
  nodes.forEach(n => {
    if (n.key !== node.key) {
      candidates.push(this.findCandidateInNode(n.key, $type, nodeTypes[n.type]));
    }
  });
  return candidates.filter(c => c);
},

findGlobalCandidate(storeName, type, globalStores) {
  if (globalStores?.find(name => name === storeName)) {
    return {/*from: 'global', */storeName, type};
  }
},

findCandidateInNode(from, type, nodeType) {
  const matchingType = (storeType) => {
    // TODO(b/244191110): Type matching API to be wired here.
    return storeType === type;
  };
  const isMatchingStore = ({$type, connection}) => matchingType($type) && !connection;
  for (const [storeName, store] of entries(nodeType?.$stores)) {
    if (isMatchingStore(store)) {
      return {from, storeName, type: store.$type};
    }
  }
}

});
