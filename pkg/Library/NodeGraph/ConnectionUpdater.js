/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

// ConnectionUpdater atm only initializes connections of newly added nodes,
// if a single candidate is available.
// In the future, a more sophisticated heuristics can be implemented to
// automatically connect nodes.

connectionDelimiter: ':',

update(inputs, state) {
  if (this.inputsChanged(inputs, state)) {
    const {graph, nodeTypes, candidates} = inputs;
    assign(state, {graph, candidates});
    if (candidates) {
      let changed = false;
      if (this.removeGraphOutdatedConnections(graph, candidates)) {
        changed = true;
      }
      if (this.updateGraphConnections(graph, nodeTypes, candidates)) {
        changed = true;
      }
      if (changed) {
        return {graph};
      }
    }
  }
},

inputsChanged({graph, candidates}, state) {
  // TODO(mariakleiner): for custom nodes, recompute connections, if nodeType changed.
  return graph &&
      (this.graphChanged(graph, state.graph) || this.candidatesChanged(candidates, state.candidates));
},

graphChanged(graph, oldGraph) {
  return graph.id !== oldGraph?.id ||
         keys(graph.nodes).length !== keys(oldGraph?.nodes).length;
},

candidatesChanged(candidates, oldCandidates) {
  return !deepEqual(candidates, oldCandidates);
},

removeGraphOutdatedConnections(graph, candidates) {
  return values(graph.nodes)
    .map(node => this.removeNodeOutdatedConnections(node, candidates[node.id]))
    .some(changed => changed);
},

removeNodeOutdatedConnections(node, candidates) {
  let changed = false;
  keys(node.connections).forEach(key => {
    const conns = node.connections[key];
    const connCandidates = candidates[key];
    if (connCandidates) {
      node.connections[key] = conns.filter(conn => this.hasMatchingCandidate(conn, connCandidates));
      if (node.connections[key].length === 0) {
        delete node.connections[key];
      }
      changed = changed || (node.connections[key]?.length === values.length);
    }
  });
  return changed;
},

hasMatchingCandidate(connection, candidates) {
  const {from, storeName} = this.parseConnection(connection);
  return candidates.some(candidate => from === candidate.from && storeName === candidate.storeName);
},

updateGraphConnections(graph, nodeTypes, candidates) {
  return values(graph.nodes)
    .map(node => this.updateNodeConnections(node, nodeTypes[node.type], candidates[node.id]))
    .some(changed => changed)
    ;
},

updateNodeConnections(node, nodeType, candidates) {
  if (candidates) {
    const initChanged = this.initializeConnections(node, nodeType, candidates);
    const nodisplayChanged = this.updateNoDisplayConnections(node, nodeType, candidates);
    return initChanged || nodisplayChanged;
  }
},

initializeConnections(node, nodeType, candidates) {
  if (!node.connections) {
    const used = [];
    keys(nodeType?.$stores).forEach(store => {
      node.connections ??= {};
      this.initializeStoreConnection(store, node, candidates[store], used);
    });
    return true;
  }
  return false;
},

initializeStoreConnection(store, node, storeCandidates, used) {
  const isUsed = (candidate) => used.find(({from, storeName}) => candidate.from === from && candidate.storeName === storeName);
  const unusedCandidates = storeCandidates?.filter(candidate => !isUsed(candidate));
  if (unusedCandidates?.length === 1) {
    node.connections[store] = [this.formatConnection(unusedCandidates[0])];
    used.push(unusedCandidates?.[0]);
  }
},

updateNoDisplayConnections(node, nodeType, candidates) {
  return keys(nodeType?.$stores)
    .map(store => {
      if (candidates[store] && nodeType.$stores[store].nodisplay) {
        node.connections[store] = candidates[store].map(this.formatConnection);
        return true;
      }
    })
    .some(changed => changed);
},

parseConnection(connection) {
  const [from, storeName] = connection.split(this.connectionDelimiter);
  return {from, storeName};
},

formatConnection({from, storeName}) {
  if (from?.length > 0) {
    return `${from}${this.connectionDelimiter}${storeName}`;
  }
  return storeName;
}

});
