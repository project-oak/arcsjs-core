/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

inspectorDelimiter: '$$',
defaultInspectorDataProp: 'inspectorData',

async update(inputs, state, {service, output, invalidate}) {
  const {selectedNodeKey, pipeline, nodeTypes, candidates} = inputs;
  if (pipeline && selectedNodeKey) {
    if (selectedNodeKey !== state.node?.key) {
      assign(state, {data: null, hasMonitor: false});
    }
    const node = pipeline.nodes[selectedNodeKey];
    if (this.shouldConstructData(inputs, state)) {
      await this.finagleCustomRecipes(state.recipes, service, false);
      assign(state, {pipeline, node, candidates, recipes: []});
      const data = await this.constructData(node, inputs, state, service);
      await this.finagleCustomRecipes(state.recipes, service, true);
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

shouldConstructData({selectedNodeKey, pipeline, candidates}, state) {
  const node = pipeline.nodes[selectedNodeKey];
  if (node) {
    return this.pipelineChanged(pipeline, state.pipeline)
        || this.nodeChanged(node, state.node)
        || this.candidatesChanged(candidates?.[selectedNodeKey], state.candidates?.[selectedNodeKey])
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

pipelineChanged(pipeline, oldPipeline) {
  return pipeline.$meta.id !== oldPipeline?.$meta?.id;
},

candidatesChanged(candidates, oldCandidates) {
  return deepEqual(candidates, oldCandidates);
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

async constructData(node, inputs, state, service) {
  const {pipeline} = inputs;
  const props = await this.constructProps(node, inputs, state,  service);
  return  {
    key: this.encodeFullNodeKey(node, pipeline, this.inspectorDelimiter),
    title: this.nodeDisplay(node),
    props
  };
},

async constructProps(node, inputs, state, service) {
  const props = [];
  this.pushToProps(props, await this.constructStoreProps(node, inputs, state, service));
  this.pushToProps(props, await this.constructConnections(node, inputs, service));
  return props;
},

pushToProps(props, moreProps) {
  if (moreProps) {
    props.push(...moreProps);
  }
},

constructStoreProps(node, inputs, state, service) {
  // construct property objects from Stores
  const nodeType = node && inputs.nodeTypes[node.type];
  const stores = nodeType?.$stores;
  if (stores) {
    return Promise.all(
      entries(stores)
        .filter(([name, store]) => !store.connection)
        .map(([name, store]) => this.computeProp(node, {name, store}, inputs, state, service))
    );
  }
},

async computeProp(node, {name, store}, inputs, state, service) {
  const {pipeline} = inputs;
  const fullNodeKey = this.encodeFullNodeKey(node, pipeline, this.inspectorDelimiter);
  const value = await this.computeBindingValue(name, store, node, service);
  this.addInspectRecipe(fullNodeKey, {name, store}, inputs, state);
  return {name, propId: this.sanitize(`${fullNodeKey}${name}`), store, value};
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

fullStoreId({key}, storeId) {
  return `${key}:${storeId}`;
},

getStoreValue(storeId, service) {
  return service({kind: 'StoreService', msg: 'GetStoreValue', data: {storeId}});
},

async constructConnections(node, {pipeline, nodeTypes, candidates}, service) {
  const matchingCandidates = keys(pipeline.nodes).every(key => candidates?.[key]);
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
    const connectedValue = await this.constructConnectedValue(selected, pipeline, nodeTypes, service);
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
      connectedStore: {$type: store.$type, $value: connectedValue}
    };
  }
},

addInspectRecipe(nodeKey, {name, store}, {customInspectors, inspectorData}, state) {
  const customInspector = customInspectors?.[store.$type];
  if (customInspector) {
    state.recipes.push(
      this.constructInspectRecipe(customInspector, nodeKey, name, inspectorData || this.defaultInspectorDataProp)
    );
  }
},

constructInspectRecipe(inspector, nodeKey, storeName, inspectorData) {
  const recipe = {
    $meta: {...inspector.$meta},
    $stores: {
      [inspectorData]: {$type: 'JSON', connection: true},
    }
  };
  this.getParticleNames(inspector).forEach(particleName => {
    const particle = {...inspector[particleName]};
    particle.$container = `Inspector#custom${this.sanitize(nodeKey)}${storeName}`;
    particle.$inputs = particle.$outputs = [{data: inspectorData}];
    particle.$staticInputs = {key: nodeKey, propName: storeName};
    recipe[`${particleName}${this.inspectorDelimiter}${nodeKey}`] = particle;
  });
  return recipe;
},

getParticleNames(recipe) {
  const notKeyword = name => !name.startsWith('$');
  return recipe && keys(recipe).filter(notKeyword);
},

async constructConnectedValue(selected, pipeline, nodeTypes, service) {
  return await Promise.all(selected?.map(
    async ({from, storeName}) => {
      const node = pipeline.nodes[from];
      const nodeType = nodeTypes[node?.type];
      if (nodeType) {
        return await this.getBindingValue(storeName, nodeType.$stores[storeName], node, service);
      }
    }
  ) || []);
},

renderCandidate({from, storeName}, pipeline) {
  const node = pipeline.nodes[from];
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
