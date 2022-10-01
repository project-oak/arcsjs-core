/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

async update({pipeline, nodeTypes, globalStores}, state) {
  if (this.pipelineChanged(pipeline, state.pipeline)) {
    state.pipeline = pipeline;
    return {
      candidates: this.findCandidates(pipeline, nodeTypes, globalStores)
    };
  }
},

pipelineChanged(pipeline, oldPipeline) {
  if (pipeline) {
    return pipeline.$meta.id !== oldPipeline?.$meta?.id
            || this.nodesChanged(pipeline.nodes, oldPipeline?.nodes);
  }  
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
    return {storeName, type};
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
