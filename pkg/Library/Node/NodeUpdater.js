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

async update({selectedNodeId, graph, data, nodeTypes}, state, {service, output}) {
  if (data && selectedNodeId && this.dataChanged(data, state.data)) {
    if (state.data?.key === data?.key) {
      if (data?.shouldDelete) {
        output(this.deleteNode(selectedNodeId, graph));
        state.data = null;
      } else {
        output(this.updateValues(selectedNodeId, graph, data, nodeTypes, state, service));
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

updateValues(selectedNodeId, graph, data, nodeTypes, state, service) {
  let changed = false;
  let node = graph.nodes[selectedNodeId];
  const nodeType = nodeTypes[node.type];
  data?.props?.forEach((prop, index) => {
    if (prop && !prop.store.noinspect) {
      const currentValue = state.data?.props?.[index]?.value;
      const updatedNode = this.updatePropValue(prop, currentValue, node, nodeType, service);
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

updatePropValue(prop, currentValue, node, nodeType, service) {
  if (prop.store?.$type === 'TypeWithConnection') {
    const innerProp = {...prop, store: prop.store.store, value: prop.value.property};
    const innerCurrentValue = currentValue?.property || currentValue;
    const propUpdated = this.updatePropValue(innerProp, innerCurrentValue, node, nodeType, service);
    const connUpdated = this.updateConnection(prop.name, prop.value.connection.value, node, nodeType, service);
    return propUpdated || connUpdated;
  }
  if (JSON.stringify(prop.value) !== JSON.stringify(currentValue)) {
    // Note: setting entire prop value (not granular by inner props).
    const newValue = this.formatPropValue(prop);
    return this.updatePropInNode(prop.name, newValue, node, service);
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

updateConnection(name, value, node, nodeType, service) {
  const props = {...node.props};
  const connections = {...node.connections};
  if (value?.length > 0) {
    delete props[name];
    this.removeStore(this.fullStoreId(node, name), service);
    connections[name] = value;
  } else {
    this.addStore(this.fullStoreId(node, name), nodeType.$stores[name], service);
    delete connections[name];
  }
  return {
    ...node,
    props,
    connections
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

addStore(storeId, store, service) {
  return service({kind: 'StoreService', msg: 'AddStore', data: {storeId, store}});
},

removeStore(storeId, service) {
  return service({kind: 'StoreService', msg: 'RemoveStore', data: {storeId}});
},

deleteNode(key, graph) {
  delete graph.nodes[key];
  this.deleteNodeFromLayout(graph.layout, key);
  return {graph, selectedNodeId: null};
},

deleteNodeFromLayout(layouts, nodeId) {
  keys(layouts).forEach(layoutId => {
    const layout = layouts[layoutId];
    delete layout[nodeId];
    delete layout[`${nodeId}:Container`];
    keys(layout).forEach(id => {
      if ((typeof layout[id] === 'string') && layout[id]?.startsWith(nodeId)) {
        delete layout[id];
      }
    });
  });
}

});