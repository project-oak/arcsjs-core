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

async update({node, pipeline, data}, state, {service, output}) {
  if (data && node?.key && this.dataChanged(data, state.data)) {
    if (state.data?.key === data?.key && data?.shouldDelete) {
      output(this.deleteNode(node, pipeline));
      state.data = null;
    } else {
      output(this.updateValues(node, pipeline, data, state, service));
      state.data = data;
    }
  }
},

dataChanged(data, oldData) {
  // TODO(mariakleiner): this is slow and not necessarily correct. Reimplement!
  return JSON.stringify(data) !== JSON.stringify(oldData);
},

updateValues(node, pipeline, data, state, service) {
  let changed = false;
  data?.props?.forEach((prop, index) => {
    if (!prop.store.noinspect) {
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
    state.node = node;
    return {
      node,
      pipeline: this.updateNodeInPipeline(node, pipeline),
      data: this.updateData(data, state)
    };
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

updateData(data, state) {
  state.data = data;
  return data;
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
  const decoded = value?.map(v => this.decodeConnectionValue(v));
  const isSelected = (candidate) => decoded.some(({from, store}) => candidate.from == from && candidate.store === store);
  const candidates = node.connections[name].candidates.map(candidate => ({
    ...candidate,
    selected: isSelected(candidate)
  }));
  return this.updateConnectionCandidates(node, name, candidates);
},

updateConnectionCandidates(node, name, candidates) {
  return {
    ...node,
    connections: {
      ...node.connections,
      [name]: {
        ...node.connections[name],
        candidates
      }
    }
  };
},

decodeConnectionValue(value) {
  if (value) {
    const [from, store] = value.split(this.inspectorDelimiter);
    return {from, store};
  }
  return null;
},

updatePropInNode(name, value, node, service) {
  this.updateStoreValue(this.fullStoreId(node, name), value, service);
  node.props = {...node.props, [name]: value};
  return node;
},

fullStoreId({key}, storeId) {
  return `${key}${storeId}`;
},

updateStoreValue(storeId, value, service) {
  return service({kind: 'StoreService', msg: 'UpdateStoreValue', data: {storeId, value}});
},

updateNodeInPipeline(node, pipeline) {
  const index = pipeline.nodes.findIndex(n => n.key === node.key);
  pipeline.nodes = assign([], pipeline.nodes, {[index]: node});
  return pipeline;
},

deleteNode({key}, pipeline) {
  pipeline.nodes = pipeline.nodes.filter(node => node.key !== key);
  return {pipeline, node: null};
}

});