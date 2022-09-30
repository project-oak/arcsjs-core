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

async update(inputs, state) {
  const {pipeline} = inputs;
  if (pipeline) {
    if (this.pipelineChanged(pipeline, state.pipeline) || this.nodesChanged(pipeline.nodes, state.nodes)) {
      state.pipeline = pipeline;
      state.nodes = [...pipeline.nodes];
      return {recipes: this.recipesForPipeline(inputs, state)};
    }
  } else {
    assign(state, {pipeline: null, nodes: []});
  }
},

nodeTypeMap(nodeTypes, state) {
  if (!state.nodeTypeMap) {
    state.nodeTypeMap = {};
    values(nodeTypes).forEach(t => state.nodeTypeMap[t.$meta.key] = this.flattenNodeType(t));
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
  return pipeline.$meta.id !== oldPipeline?.$meta?.id;
},

nodesChanged(nodes, oldNodes) {
  if (nodes?.length === oldNodes?.length) {
    return !oldNodes?.every(node => this.hasSameNode(node, nodes));
  }
  return true;
},

hasSameNode(node, nodes) {
  const nodeInNodes = nodes.find(n => n.key === node.key);
  if (nodeInNodes) {
    if (deepEqual(nodeInNodes, node)) {
      return true;
    }
  }
  //log('hasSameNode: FALSE:', nodeInNodes, node);
  return false;
},

recipesForPipeline(inputs, state) {
  const {pipeline} = inputs;
  return pipeline.nodes.map(node => this.recipeForNode(node, inputs, state));
},

recipeForNode(node, inputs, state) {
  const {pipeline, nodeTypes} = inputs;
  const nodeTypeMap = this.nodeTypeMap(nodeTypes, state);
  const nodeType = nodeTypeMap[node.type];
  const stores = this.buildStoreSpecs(node, nodeType, state);
  const recipe = this.buildParticleSpecs(node, nodeType, state);
  recipe.$meta = {
    name: this.encodeFullNodeKey(node, pipeline, this.connectorDelim)
  };
  recipe.$stores = stores;
  return recipe;
},

buildParticleSpecs(node, nodeType, {storeMap}) {
  const specs = {};
  const names = this.getParticleNames(nodeType) || [];
  for (const particleName of names) {
    specs[this.constructParticleId(node, particleName)] =
        this.buildParticleSpec(node, nodeType, particleName, `main#runner`, storeMap);
  }
  return specs;
},

getParticleNames(recipe) {
  const notKeyword = name => !name.startsWith('$');
  return recipe && keys(recipe).filter(notKeyword);
},

constructParticleId({key}, particleName) {
  return `${key}${this.nameDelim}${particleName}`;
},

buildParticleSpec(node, nodeType, particleName, defaultContainer, storeMap) {
  const particleSpec = nodeType[particleName];
  const $container = this.resolveContainer(
    node.key,
    particleSpec.$container,
    node.position?.preview?.[`${node.key}${particleName}:Container`] || defaultContainer
  );
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
  return containerName ? `${nodeName}${containerName}` : defaultContainer;
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
      const storeId = this.constructStoreId({from: node.key, storeName: name});
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
  if (store.value === `node.key`) {
    return node.key;
  }
  return store.$value;
},

encodeFullNodeKey({key}, {$meta}, delimiter) {
  return [$meta?.name, key].filter(Boolean).join(delimiter);
}

});
