/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

inspectorDelimiter: '$$',

async update({node, pipeline, nodeTypes}, state, {service, output, invalidate}) {
  if (node?.key) {
    const nodeType = this.findNodeType(node?.name, nodeTypes);
    if (node?.key !== state.node?.key) {
      assign(state, {data: null, hasMonitor: false});
    }
    if (this.nodeChanged(node, state.node) || !state.hasMonitor) {
      state.node = node;
      const data = await this.constructData(node, pipeline, nodeTypes, service);
      await output({data, nodeType});
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

formatTitle({name, index}) {
  return this.nodeDisplay({name, index});
},

async monitorStores(state, nodeTypes, {service, invalidate}) {
  const nodeType = this.findNodeType(state.node.name, nodeTypes);
  if (nodeType) {
    const result = await service({
      msg: 'ListenToChanges',
      data: {storeIds: this.getNodeStoreIds(state.node, nodeType)}
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

getNodeStoreIds(node, {$stores}) {
  return $stores && keys($stores).map(id => this.fullStoreId(node, id));
},

async constructData(node, pipeline, nodeTypes, service) {
  const props = await this.constructProps(node, pipeline, nodeTypes, service);
  return  {
    key: this.encodeFullNodeKey(node, pipeline, this.inspectorDelimiter),
    title: node.displayName || this.formatTitle(node),
    props
  };
},

async constructProps(node, pipeline, nodeTypes, service) {
  const props = [];
  this.pushToProps(props, await this.constructStoreProps(node, pipeline, nodeTypes, service));
  this.pushToProps(props, await this.constructConnections(node, pipeline, nodeTypes, service));
  return props;
},

pushToProps(props, moreProps) {
  if (moreProps) {
    props.push(...moreProps);
  }
},

constructStoreProps(node, pipeline, nodeTypes, service) {
  // construct property objects from Stores
  const nodeType = node && this.findNodeType(node.name, nodeTypes);
  const stores = nodeType?.$stores;
  if (stores) {
    return Promise.all(
      entries(stores)
        .filter(([name, store]) => !store.connection)
        .map(([name, store]) => this.computeProp(node, this.encodeFullNodeKey(node, pipeline, ''), {name, store}, service))
    );
  }
},

findNodeType(name, nodeTypes) {
  return nodeTypes.find(({$meta}) => $meta.name === name);
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
  return `${key}${storeId}`;
},

getStoreValue(storeId, service) {
  return service({kind: 'StoreService', msg: 'GetStoreValue', data: {storeId}});
},

async constructConnections({connections}, pipeline, nodeTypes, service) {
  if (connections) {
    return Promise.all(keys(connections).map(storeName => {
      return this.renderBinding(storeName, connections[storeName], pipeline, nodeTypes, service);
    }));
  }
},

async renderBinding(name, connection, pipeline, nodeTypes, service) {
  const froms = connection.candidates.map(candidate => this.renderCandidate(candidate, pipeline)).filter(from => from);
  const selected = connection.candidates.filter(candidate => candidate.selected);
  const multiple = connection.store.multiple;
  const value = selected?.map(s => this.encodeConnectionValue(s));
  const connectedStore = await this.constructConnectedStore(connection, selected, pipeline, nodeTypes, service);
  return {
    name,
    store: {...connection.store, $type: 'Connection', multiple, values: froms},
    value,
    connectedStore
  };
},

async constructConnectedStore(connection, selected, pipeline, nodeTypes, service) {
  const value = await Promise.all(selected?.map(
    async ({from, store}) => {
      const node = pipeline.nodes.find(node => node.key == from);
      if (node) {
        const nodeType = this.findNodeType(node.name, nodeTypes);
        return await this.getBindingValue(store, nodeType.$stores[store], node, service);
      }
    }
  ) || []);
  return {$type: connection.store.$type, value};
},

renderCandidate({from, store}, pipeline) {
  const node = pipeline.nodes.find(n => n.key === from);
  if (node) {
    return {
      key: this.encodeConnectionValue({from, store}),
      name: `${this.nodeDisplay(node)} - ${store}`,
    };
  }
},

encodeConnectionValue({from, store}) {
  return `${from}${this.inspectorDelimiter}${store}`;
},

encodeFullNodeKey({key}, {$meta}, delimiter) {
  return [$meta?.name, key].filter(Boolean).join(delimiter);
},

sanitize(key) {
  return key.replace(/[^A-Za-z0-9]/g, '');
},

nodeDisplay({name, index}) {
  const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1);
  return `${capitalize(name)}${index > 1 ? ` ${index}` : ''}`;
}

});
