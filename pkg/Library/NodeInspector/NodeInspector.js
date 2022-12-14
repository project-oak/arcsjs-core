/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
connectionDelimiter: ':',
inspectorDelimiter: '$$',
defaultInspectorDataProp: 'inspectorData',

async update(inputs, state, {service, output, invalidate}) {
  const {selectedNodeId, graph, nodeTypes, candidates} = inputs;
  if (graph && selectedNodeId) {
    if (selectedNodeId !== state.node?.id) {
      assign(state, {data: null, hasMonitor: false});
    }
    const node = graph.nodes[selectedNodeId];
    if (this.shouldConstructData(inputs, state)) {
      await this.finagleCustomRecipes(state.recipes, service, false);
      assign(state, {graph, node, candidates, recipes: []});
      const data = await this.constructData(node, inputs, state, service);
      await this.finagleCustomRecipes(state.recipes, service, true);
      await output({data});
    }
    if (!state.hasMonitor && state.node) {
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

shouldConstructData({selectedNodeId, graph, candidates}, state) {
  const node = graph.nodes[selectedNodeId];
  if (node) {
    return this.graphChanged(graph, state.graph)
        || this.nodeChanged(node, state.node)
        || this.candidatesChanged(candidates?.[selectedNodeId], state.candidates?.[selectedNodeId])
        || !state.hasMonitor;
  }
  return false;
},

nodeChanged({key, connections, props, displayName}, node) {
  return node?.key !== key
      || node?.displayName !== displayName
      || JSON.stringify(node?.connections) != JSON.stringify(connections)
      || JSON.stringify(node?.props) !== JSON.stringify(props);
},

graphChanged(graph, oldGraph) {
  return graph.$meta.id !== oldGraph?.$meta?.id;
},

candidatesChanged(candidates, oldCandidates) {
  return !deepEqual(candidates, oldCandidates);
},

async finagleCustomRecipes(recipes, service, finagle) {
  return Promise.all(recipes?.map(
    recipe => service({kind: 'RecipeService', msg: 'FinagleRecipe', data: {recipe, value: finagle}})
  ) || []);
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
      //log(`${storeId} has changed affecting node ${state.node.id}`);
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

async constructData(node, inputs, state, service) {
  const {graph} = inputs;
  const props = await this.constructProps(node, inputs, state,  service);
  return  {
    key: this.encodeFullNodeId(node, graph, this.inspectorDelimiter),
    title: node.displayName,
    props
  };
},

pushToProps(props, moreProps) {
  if (moreProps) {
    props.push(...moreProps);
  }
},

async constructProps(node, inputs, state, service) {
  // construct property objects from Stores
  const props = [];
  const {graph, nodeTypes, candidates} = inputs;
  const nodeType = node && nodeTypes[node.type];
  const stores = nodeType?.$stores;
  if (stores) {
    for(let [name, store] of entries(stores)) {
      const prop = await this.computeProp(node, {name, store}, inputs, state, service);
      const bindingProp = await this.renderBinding(node, name, candidates[node.id][name], graph, nodeTypes, service);
      props.push(prop);
      if (bindingProp) {
        if (bindingProp?.length > 0) {
          prop.disabled = true;
        }
        props.push(bindingProp);
      }
    }
  }
  return props;
},

async computeProp(node, {name, store}, inputs, state, service) {
  const {graph} = inputs;
  const fullNodeId = this.encodeFullNodeId(node, graph, this.inspectorDelimiter);
  const value = await this.computeBindingValue(name, store, node, service);
  if (!store.noinspect) {
    this.addInspectRecipe(fullNodeId, {name, store}, inputs, state);
  }
  return {name, propId: this.sanitize(`${fullNodeId}${name}`), store, value};
},

async computeBindingValue(name, store, node, service) {
  let value = await this.getBindingValue(name, store, node, service);
  if (store?.$type === 'Boolean') {
    value = Boolean(value);
  } else if (store?.$type === 'Image') {
    value = value?.url;
  } else if (store.$type === '[Image]') {
    value = value?.map(v => ({src: v.url}));
  }
  return value;
},

async getBindingValue(name, store, node, service) {
  const binding = this.fullStoreId(node, name);
  const storeValue = (await this.getStoreValue(binding, service))?.value;
  return storeValue ?? node.props?.[name] ?? store.$value;
},

fullStoreId({id}, storeId) {
  return `${id}:${storeId}`;
},

getStoreValue(storeId, service) {
  return service({kind: 'StoreService', msg: 'GetStoreValue', data: {storeId}});
},

async renderBinding(node, name, candidates, graph, nodeTypes, service) {
  if (candidates) {
    const froms = candidates.map(candidate => this.renderCandidate(candidate, graph)).filter(from => from);
    const value = node.connections?.[name] || [];
    const store = nodeTypes[node.type].$stores[name];
    const multiple = store.multiple;
    const connectedValue = await this.constructConnectedValue(value, graph, nodeTypes, service);
<<<<<<< HEAD:pkg/Library/NodeInspector/NodeInspector.js
    const skipConn = (store.nodisplay || (store.noinspect && !(froms.length > 0)));
    if (!skipConn) {
      return {
        name: `${name}-connection`,
        store: {
          ...store,
          $type: 'Connection',
          noinspect: store.nodisplay,
          // noinspect: store.nodisplay,// || store.noinspect,
          multiple,
          values: froms
        },
        value,
        connectedStore: {$type: store.$type, $value: connectedValue}
      };
    }
=======
    return {
      name: `${name}-connection`,
      store: {
        ...store,
        $type: 'Connection',
        noinspect: store.nodisplay || store.noinspect,
        multiple,
        values: froms
      },
      value,
      connectedStore: {$type: store.$type, $value: connectedValue}
    };
>>>>>>> a32a687 (update nodes with connections, and fix Designer):pkg/Library/NodeGraph/NodeInspector.js
  }
},

addInspectRecipe(nodeId, {name, store}, {customInspectors, inspectorData}, state) {
  const customInspector = customInspectors?.[store.$type];
  if (customInspector) {
    state.recipes.push(
      this.constructInspectRecipe(customInspector, nodeId, name, inspectorData || this.defaultInspectorDataProp)
    );
  }
},

constructInspectRecipe(inspector, nodeId, storeName, inspectorData) {
  const recipe = {
    $meta: {...inspector.$meta},
    $stores: {
      [inspectorData]: {$type: 'JSON', connection: true},
    }
  };
  this.getParticleNames(inspector).forEach(particleName => {
    const particle = {...inspector[particleName]};
    particle.$container = `Inspector#custom${this.sanitize(nodeId)}${storeName}`;
    particle.$inputs = particle.$outputs = [{data: inspectorData}];
    particle.$staticInputs = {key: nodeId, propName: storeName};
    recipe[`${particleName}${this.inspectorDelimiter}${nodeId}`] = particle;
  });
  return recipe;
},

getParticleNames(recipe) {
  const notKeyword = name => !name.startsWith('$');
  return recipe && keys(recipe).filter(notKeyword);
},

async constructConnectedValue(selected, graph, nodeTypes, service) {
  return await Promise.all(selected?.map(
    async ({from, storeName}) => {
      const node = graph.nodes[from];
      const nodeType = nodeTypes[node?.type];
      if (nodeType) {
        return await this.getBindingValue(storeName, nodeType.$stores[storeName], node, service);
      }
    }
  ) || []);
},

renderCandidate({from, storeName}, graph) {
  const node = graph.nodes[from];
  if (node) {
    return {
      key: this.encodeConnectionValue({from, storeName}),
      name: `${node.displayName} - ${storeName}`,
    };
  }
},

encodeConnectionValue({from, storeName}) {
  return `${from}${this.connectionDelimiter}${storeName}`;
},

encodeFullNodeId({id}, {$meta}, delimiter) {
  return [$meta.id, id].filter(Boolean).join(delimiter);
},

sanitize(key) {
  return key.replace(/[^A-Za-z0-9]/g, '');
}

});