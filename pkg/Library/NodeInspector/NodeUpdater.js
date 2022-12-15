/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

inspectorDelimiter: '$$',

async update({selectedNodeId, graph, data}, state, {service, output}) {
  if (data && selectedNodeId && this.dataChanged(data, state.data)) {
    if (state.data?.key === data?.key) {
      if (data?.shouldDelete) {
        output(this.deleteNode(selectedNodeId, graph));
        state.data = null;
      } else {
        output(this.updateValues(selectedNodeId, graph, data, state, service));
        state.data = data;
      }
    } else {
      state.data = data;
    }
  }
},

dataChanged(data, oldData) {
  // TODO(mariakleiner): this is slow and not necessarily correct. Reimplement!
  return JSON.stringify(data) !== JSON.stringify(oldData);
},

updateValues(selectedNodeId, graph, data, state, service) {
  let changed = false;
  let node = graph.nodes[selectedNodeId];
  data?.props?.forEach((prop, index) => {
    if (prop && !prop.store.noinspect) {
      const currentValue = state.data?.props?.[index]?.value;
      const updatedNode = this.updatePropValue(prop, currentValue, node, service);
      if (updatedNode) {
        node = updatedNode;
        changed = true;
      }
    }
  });
  if (node.displayName !== state.data?.title) {
    changed = true;
  }
  if (changed) {
    graph.nodes[node.id] = node;
    return {graph};
  }
},

updatePropValue(prop, currentValue, node, service) {
  if (JSON.stringify(prop.value) !== JSON.stringify(currentValue)) {
    // Note: setting entire prop value (not granular by inner props).
    const newValue = this.formatPropValue(prop);
    if (prop.store.connection) {
      return this.updateConnection(prop.name, newValue, node);
    } else {
      return this.updatePropInNode(prop.name, newValue, node, service);
    }
  }
},

formatPropValue({value, store: {$type}}) {
  if ($type === 'Image') {
    return {url: value};
  } else if ($type === '[Image]') {
    return value?.map(v => ({url : v.src}));
  }
  return value;
},

updateConnection(name, value, node) {
  return {
    ...node,
    connections: {
      ...node.connections,
      [name]: value || []
    }
  };
},

decodeConnectionValue(value) {
  if (value) {
    const [from, storeName] = value.split(this.inspectorDelimiter);
    return {from, storeName};
  }
  return null;
},

updatePropInNode(name, value, node, service) {
  this.updateStoreValue(this.fullStoreId(node, name), value, service);
  node.props = {...node.props, [name]: value};
  return node;
},

fullStoreId({id}, storeId) {
  return `${id}:${storeId}`;
},

updateStoreValue(storeId, value, service) {
  return service({kind: 'StoreService', msg: 'UpdateStoreValue', data: {storeId, value}});
},

deleteNode(key, graph) {
  delete graph.nodes[key];
  return {graph, selectedNodeId: null};
}

});