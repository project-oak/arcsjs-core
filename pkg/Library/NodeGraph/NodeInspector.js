/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

inspectorDelimiter: '$$',

async update({selectedNodeKey, pipeline, nodeTypes, candidates}, state, {service, output, invalidate}) {
  if (pipeline && selectedNodeKey) {
    if (selectedNodeKey !== state.node?.key) {
      assign(state, {data: null, hasMonitor: false});
    }
    const node = pipeline.nodes.find(node => node.key === selectedNodeKey);
    if (this.pipelineChanged(pipeline, state.pipeline) ||
        (node && this.nodeChanged(node, state.node) || !state.hasMonitor)) {
      state.pipeline = pipeline;
      state.node = node;
      const data = await this.constructData(node, pipeline, nodeTypes, candidates, service);
      await output({data});
    }
    if (!state.hasMonitor) {
      state.hasMonitor = true;
      // calling async method without awaiting it, on purpose,
      // which creates Special Circumstances, see below
      this.monitorStores(state, nodeTypes, {service, invalidate});
    }
  } else {
    state.node = null;
    return {data: null, nodeType: null};
  }
},

nodeChanged({key, connections, props, displayName}, node) {
  return node?.key !== key
      || node?.displayName !== displayName
      || JSON.stringify(node?.connections) != JSON.stringify(connections)
      || JSON.stringify(node?.props) !== JSON.stringify(props);
},

pipelineChanged(pipeline, oldPipeline) {
  return this.pipelineId(pipeline) !== this.pipelineId(oldPipeline);
},

pipelineId(pipeline) {
  // Backward compatibility for pipelines published in versions < 0.4
  return pipeline?.$meta?.id || pipeline?.$meta?.name;
},

async monitorStores(state, nodeTypes, {service, invalidate}) {
  const nodeType = nodeTypes[state.node.type];
  if (nodeType) {
    const result = await service({
      kind: 'StoreService',
      msg: 'ListenToChanges',
      data: {storeIds: this.getMonitoredNodeStoreIds(state.node, nodeType)}
    });
    if (result) {
      //log(`${storeId} has changed affecting node ${state.node.key}`);
      // this method is untethered from return stack because of
      // Special Circumstances created above, so we provoke
      // a change manually
      assign(state, {hasMonitor: false});
      invalidate();
    } else {
      // something bad happened, so we stop trying
    }
  }
},

getMonitoredNodeStoreIds(node, {$stores}) {
  return $stores && keys($stores)
    .filter(id => !$stores[id].nomonitor)
    .map(id => this.fullStoreId(node, id))
    ;
},

async constructData(node, pipeline, nodeTypes, candidates, service) {
  const props = await this.constructProps(node, pipeline, nodeTypes, candidates, service);
  return  {
    key: this.encodeFullNodeKey(node, pipeline, this.inspectorDelimiter),
    title: this.nodeDisplay(node),
    props
  };
},

async constructProps(node, pipeline, nodeTypes, candidates, service) {
  const props = [];
  this.pushToProps(props, await this.constructStoreProps(node, pipeline, nodeTypes, service));
  this.pushToProps(props, await this.constructConnections(node, pipeline, nodeTypes, candidates, service));
  return props;
},

pushToProps(props, moreProps) {
  if (moreProps) {
    props.push(...moreProps);
  }
},

constructStoreProps(node, pipeline, nodeTypes, service) {
  // construct property objects from Stores
  const nodeType = node && nodeTypes[node.type];
  const stores = nodeType?.$stores;
  if (stores) {
    return Promise.all(
      entries(stores)
        .filter(([name, store]) => !store.connection)
        .map(([name, store]) => this.computeProp(node, this.encodeFullNodeKey(node, pipeline, ''), {name, store}, service))
    );
  }
},

async computeProp(node, fullNodeKey, {name, store}, service) {
  let value = await this.getBindingValue(name, store, node, service);
  if (store?.$type === 'Boolean') {
    value = Boolean(value);
  } else if (store?.$type === 'Image') {
    value = value?.url;
  } else if (store.$type === '[Image]') {
    value = value?.map(v => ({src: v.url}));
  }
  return {name, propId: this.sanitize(`${fullNodeKey}${name}`), store, value};
},

async getBindingValue(name, store, node, service) {
  const binding = this.fullStoreId(node, name);
  const storeValue = (await this.getStoreValue(binding, service));
  return storeValue ?? node.props?.[name] ?? store.$value;
},

fullStoreId({key}, storeId) {
  return `${key}:${storeId}`;
},

getStoreValue(storeId, service) {
  return service({kind: 'StoreService', msg: 'GetStoreValue', data: {storeId}});
},

async constructConnections(node, pipeline, nodeTypes, candidates, service) {
  const matchingCandidates = (pipeline.nodes.every(({key}) => candidates?.[key]));
  if (matchingCandidates) {
    return Promise.all(keys(candidates[node.key]).map(storeName => {
      return this.renderBinding(node, storeName, candidates[node.key][storeName], pipeline, nodeTypes, service);
    }));
  }
},

async renderBinding(node, name, candidates, pipeline, nodeTypes, service) {
  if (candidates) {
    const froms = candidates.map(candidate => this.renderCandidate(candidate, pipeline)).filter(from => from);
    const selected = node.connections?.[name] || [];
    const store = nodeTypes[node.type].$stores[name];
    const multiple = store.multiple;
    const value = selected?.map(s => this.encodeConnectionValue(s));
    // const connectedStore = await this.constructConnectedStore(connection, selected, pipeline, nodeTypes, service);
    return {
      name,
      store: {
        ...store,
        $type: 'Connection',
        noinspect: store.nodisplay,
        multiple,
        values: froms
      },
      value,
      // connectedStore
    };
  }
},

// SOMEHOW USER IN SHADERTOY! WHY???
// async constructConnectedStore(connection, selected, pipeline, nodeTypes, service) {
//   const value = await Promise.all(selected?.map(
//     async ({from, store}) => {
//       const node = pipeline.nodes.find(node => node.key == from);
//       if (node) {
//         const nodeType = nodeTypes[node.type]; //this.findNodeType(node.name, nodeTypes);
//         if (nodeType) {
//           return await this.getBindingValue(store, nodeType.$stores[store], node, service);
//         }
//       }
//     }
//   ) || []);
//   return {$type: connection.store.$type, value};
// },

renderCandidate({from, storeName}, pipeline) {
  const node = pipeline.nodes.find(n => n.key === from);
  if (node) {
    return {
      key: this.encodeConnectionValue({from, storeName}),
      name: `${this.nodeDisplay(node)} - ${storeName}`,
    };
  }
},

encodeConnectionValue({from, storeName}) {
  return `${from}${this.inspectorDelimiter}${storeName}`;
},

encodeFullNodeKey({key}, {$meta}, delimiter) {
  return [$meta?.name, key].filter(Boolean).join(delimiter);
},

sanitize(key) {
  return key.replace(/[^A-Za-z0-9]/g, '');
},

nodeDisplay(node) {
  return node.displayName || node.name;
}

});
