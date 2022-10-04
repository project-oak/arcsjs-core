/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

connectorDelim: '$$',
nameDelim: ':',
defaultContainer: `main#runner`,

async update(inputs, state) {
  const {pipeline, layout} = inputs;
  if (pipeline) {
    let changed = false;
    if (this.pipelineChanged(pipeline, state.pipeline)) {
      state.pipeline = pipeline;
      changed = true;
    }
    if (this.layoutChanged(pipeline, layout, state.layout)) {
      assign(state, {layout});
      changed = true;
    }
    if (changed) {
      return {recipes: this.recipesForPipeline(inputs, state)};
    }
  } else {
    state.pipeline = null;
  }
},

nodeTypeMap(nodeTypes, state) {
  if (!state.nodeTypeMap) {
    state.nodeTypeMap = {};
    values(nodeTypes).forEach(t => state.nodeTypeMap[t.$meta.id] = this.flattenNodeType(t));
  }
  return state.nodeTypeMap;
},

flattenNodeType(nodeType, $container) {
  const flattened = {};
  keys(nodeType).forEach(key => {
    if (key.startsWith('$')) {
      flattened[key] = nodeType[key];
    } else {
      assign(flattened, this.flattenParticleSpec(key, nodeType[key], $container));
    }
  });
  return flattened;
},

flattenParticleSpec(particleId, particleSpec, $container) {
  const flattened = {
    [particleId]: {
      ...particleSpec,
      $slots: {},
      ...($container && {$container})
    }
  };
  entries(particleSpec.$slots || {}).forEach(([slotId, slotRecipe]) => {
    assign(flattened, this.flattenNodeType(slotRecipe, `${particleId}#${slotId}`));
  });
  return flattened;
},

pipelineChanged(pipeline, oldPipeline) {
  return pipeline.$meta.id !== oldPipeline?.$meta?.id
      || this.nodesChanged(pipeline.nodes, oldPipeline?.nodes);
},

nodesChanged(nodes, oldNodes) {
  if (keys(nodes).length === keys(oldNodes).length) {
    return !keys(oldNodes).every(key => deepEqual(oldNodes[key], nodes[key]));
  }
  return true;
},

layoutChanged(pipeline, layout, oldLayout) {
  return (pipeline.$meta.id === layout?.id) && !deepEqual(layout, oldLayout);
},

recipesForPipeline(inputs, state) {
  const {pipeline} = inputs;
  return values(pipeline.nodes).map(node => this.recipeForNode(node, inputs, state));
},

recipeForNode(node, inputs, state) {
  const {pipeline, nodeTypes, layout} = inputs;
  const nodeTypeMap = this.nodeTypeMap(nodeTypes, state);
  const nodeType = nodeTypeMap[node.type];
  const stores = this.buildStoreSpecs(node, nodeType, state);
  const recipe = this.buildParticleSpecs(node, nodeType, layout, state);
  recipe.$meta = {
    name: this.encodeFullNodeId(node, pipeline, this.connectorDelim)
  };
  recipe.$stores = stores;
  return recipe;
},

buildParticleSpecs(node, nodeType, layout, {storeMap}) {
  const specs = {};
  const names = this.getParticleNames(nodeType) || [];
  for (const particleName of names) {
    const container = layout?.[`${node.id}${nameDelim}Container`] || this.defaultContainer;
    specs[this.constructParticleId(node, particleName)] =
        this.buildParticleSpec(node, nodeType, particleName, container, storeMap);
  }
  return specs;
},

getParticleNames(recipe) {
  const notKeyword = name => !name.startsWith('$');
  return recipe && keys(recipe).filter(notKeyword);
},

constructParticleId({id}, particleName) {
  return `${id}${this.nameDelim}${particleName}`;
},

buildParticleSpec(node, nodeType, particleName, container, storeMap) {
  const particleSpec = nodeType[particleName];
  const $container = this.resolveContainer(node.id, particleSpec.$container, container);
  const bindings = this.resolveBindings(particleSpec, storeMap);
  const resolvedSpec = {
    $slots: {},
    ...particleSpec,
    ...bindings,
    ...($container && {$container})
  };
  return resolvedSpec;
},

resolveContainer(nodeName, containerName, defaultContainer) {
  return containerName ? `${nodeName}${nameDelim}${containerName}` : defaultContainer;
},

resolveBindings(particleSpec, storeMap) {
  const {$inputs, $outputs} = particleSpec;
  return {
    $inputs: this.resolveGroup($inputs, storeMap),
    $outputs: this.resolveGroup($outputs, storeMap),
  };
},

buildStoreSpecs(node, nodeType, state) {
  const specs = {};
  state.storeMap = {};
  entries(nodeType.$stores).forEach(([name, store]) => {
    if (store.connection) {
      const connections = node.connections?.[name];
      connections?.forEach(connection => {
        const storeId = this.constructStoreId(connection);
        specs[storeId] = {$type: store.$type};
        state.storeMap[name] = storeId;
      });
    } else {
      const storeId = this.constructStoreId({from: node.id, storeName: name});
      specs[storeId] = this.buildStoreSpec(store, node.props?.[name], node);
      state.storeMap[name] = storeId;
    }
  });
  return specs;
},

resolveGroup(bindings, storeMap) {
  return bindings?.map(coded => {
    const {key, binding} = this.decodeBinding(coded);
    return {[key]: storeMap[binding || key]};
  }).flat();
},

constructStoreId({from, storeName}) {
  if (from) {
    return `${from}${this.nameDelim}${storeName}`;
  }
  return storeName;
},

decodeBinding(value) {
  if (typeof value === 'string') {
    return {key: value, binding: ''};
  } else {
    const [key, binding] = entries(value)[0];
    return {key, binding};
  }
},

buildStoreSpec(store, value, node) {
  return {
    $type: store.$type,
    $value: this.formatStoreValue(store, value, node)
  };
},

formatStoreValue(store, value, node) {
  if (value !== undefined) {
    return value;
  }
  // TODO(mariakleiner): Revisit how to express special default values supported by NodesConnector.
  if (store.value === `node.id`) {
    return node.id;
  }
  return store.$value;
},

encodeFullNodeId({id}, {$meta}, delimiter) {
  return [$meta.id, id].filter(Boolean).join(delimiter);
}

});
