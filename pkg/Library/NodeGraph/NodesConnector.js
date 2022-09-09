/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
/* global scope */
({

connectorDelim: '$$',
nameDelim: ':',

shouldUpdate({nodeTypes}) {
  return !nodeTypes.empty;
},

async update(inputs, state, {service}) {
  const {pipeline, nodeTypes} = inputs;
  if (!state.nodeTypeMap) {
    state.nodeTypeMap = {};
    values(nodeTypes).forEach(t => state.nodeTypeMap[t.$meta.name] = this.flattenNodeType(t));
  }

  if (pipeline?.nodes) {
    if (this.pipelineChanged(pipeline, state.pipeline)
        || this.nodesDidChange(pipeline.nodes, state.nodes)) {
      state.pipeline = pipeline;
      state.nodes = [...pipeline.nodes];
      return this.updateNodes(inputs, state);
    }
  }
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
  return this.pipelineId(pipeline) !== this.pipelineId(oldPipeline);
},

pipelineId(pipeline) {
  // Backward compatibility for pipelines published in versions < 0.4
  return pipeline?.$meta?.id || pipeline?.$meta?.name;
},

nodesDidChange(nodes, currentNodes) {
  if (nodes?.length === currentNodes?.length) {
    return !currentNodes?.every(node => this.hasSameNode(node, nodes));
  }
  return true;
},

hasSameNode(node, nodes) {
  const nodeInNodes = nodes.find(n => n.key === node.key);
  if (nodeInNodes) {
    if (scope.deepEqual(nodeInNodes, node)) {
      return true;
    }
  }
  //log('hasSameNode: FALSE:', nodeInNodes, node);
  return false;
},

async updateNodes({pipeline, selectedNode, customInspectors, inspectorData, globalStores}, {nodeTypeMap}) {
  pipeline.nodes = pipeline.nodes.map(
    node => this.updateNodeConnectionCandidates({node, pipeline, nodeTypeMap, globalStores}));
  const recipes = pipeline.nodes
    .map(node => this.recipeForNode(node, nodeTypeMap, pipeline, customInspectors, inspectorData || 'inspectorData', globalStores))
    .filter(recipe => recipe)
    ;
  return {
    pipeline,
    recipes,
    selectedNode: pipeline.nodes.find(n => n.key === selectedNode?.key),
  };
},

updateNodeConnectionCandidates({node, pipeline, nodeTypeMap, globalStores}) {
  const connections = this.updateNodeStoreConnections(node, pipeline, nodeTypeMap, globalStores);
  return {
    ...node,
    ...(keys(connections).length > 0 && {connections})
  };
},

updateNodeStoreConnections(node, pipeline, nodeTypeMap, globalStores) {
  const connections = {};
  const nodeType = nodeTypeMap[node.name];
  nodeType?.$stores && entries(nodeType.$stores).forEach(([storeName, store]) => {
    if (store.connection) {
      const bindings = this.findStoreBindings(storeName, nodeType);
      const candidates = this.findConnectionCandidates(storeName, store, node, pipeline, nodeTypeMap, globalStores);
      connections[storeName] = {store, bindings, candidates};
    }
  });
  if (!node.connections) {
    this.initDefaultCandidates(connections);
  }
  return connections;
},

initDefaultCandidates(connections) {
  const used = new Set();
  keys(connections).forEach(storeName => {
    const {bindings, candidates} = connections[storeName];
    if (candidates.length === 1 && bindings?.length > 0) {
      const candidateId = this.constructStoreId(candidates[0]);
      if (!used.has(candidateId)) {
        candidates[0].selected = true;
        used.add(candidateId);
      }
    }
  });
},

findConnectionCandidates(storeName, {$type}, node, {nodes}, nodeTypeMap, globalStores) {
  if (this.findGlobalCandidate(storeName, globalStores)) {
    return [{from: 'global', store: storeName, type: $type, selected: true}];
  }
  const candidates = [];
  nodes.forEach(n => {
    const candidate = this.findCandidateInNode($type, n, nodeTypeMap);
    if (candidate && candidate.from !== node.key) {
      if (node.connections) {
        candidate.selected = node.connections[storeName]?.candidates.find(({from, store}) => from === candidate.from && store === candidate.store)?.selected;
      }
      candidates.push(candidate);
    }
  });
  return candidates;
},

findGlobalCandidate(storeName, globalStores) {
  return globalStores?.find(name => name === storeName);
},

findCandidateInNode(type, node, nodeTypeMap) {
  const nodeType = nodeTypeMap[node.name];
  if (nodeType) {
    const store = this.findMatchingStore(type, nodeType.$stores);
    if (store) {
      return ({from: node.key, store: store.name, type: store.$type});
    }
  }
},

findMatchingStore(type, stores) {
  const matchingType = (storeType) => {
    // TODO(b/244191110): Type matching API to be wired here.
    return storeType === type;
  };
  const matchingStore = (store) => matchingType(store.$type) && !store.connection;
  const name = stores && keys(stores).find(name => matchingStore(stores[name]));
  if (name) {
    return {name, ...stores[name]};
  }
},

findStoreBindings(store, nodeType) {
  const bindings = [];
  this.particleNames(nodeType).forEach(particleName =>  {
    this.addInputBindings(store, nodeType, particleName, bindings);
  });
  return bindings;
},

particleNames(nodeType) {
  const isKeyword = name => name.startsWith('$');
  return keys(nodeType).filter(name => !isKeyword(name));
},

addInputBindings(store, nodeType, particleName, bindings) {
  const {$inputs} = nodeType[particleName];
  const addBinding = ({key, binding}) => {
    if ((binding || key) === store) {
      bindings.push({particleName, binding: key});
    }
  };
  $inputs?.forEach(input => addBinding(this.decodeBinding(input)));
},

decodeBinding(value) {
  if (typeof value === 'string') {
    return {key: value, binding: ''};
  } else {
    const [key, binding] = entries(value)[0];
    return {key, binding};
  }
},

recipeForNode(node, nodeTypeMap, pipeline, customInspectors, inspectorData, globalStores) {
  const nodeType = nodeTypeMap[node.name];
  const recipe = this.buildParticleSpecs(nodeType, node, globalStores);
  recipe.$meta = {
    name: this.encodeFullNodeKey(node, pipeline, this.connectorDelim)
  };
  if (nodeType?.$stores) {
    recipe.$stores = this.buildStoreSpecs(node, nodeType, nodeTypeMap, pipeline);
  }
  this.addInspectorSpecs(recipe, node, nodeType, customInspectors, inspectorData);
  return recipe;
},

addInspectorSpecs(recipe, node, nodeType, customInspectors, inspectorData) {
  let hasInspector = false;
  keys(nodeType?.$stores || {}).forEach(storeName => {
    const store = nodeType.$stores[storeName];
    const inspector = customInspectors?.[store.$type];
    if (inspector) {
      this.getParticleNames(inspector).forEach(particleName => {
        const particleId = `__${particleName}${node.key}`;
        recipe[particleId] = this.constructInspectParticle(recipe.$meta.name, inspector[particleName], storeName, inspectorData);
        hasInspector = true;
      });
    }
  });
  if (hasInspector) {
    recipe.$stores[inspectorData] = {$type: 'JSON', connection: true};
  }
},

constructInspectParticle(key, spec, storeName, inspectorData) {
  const particle = {...spec};
  particle.$container = `Inspector#custom${this.sanitize(key)}${storeName}`;
  particle.$inputs = particle.$outputs = [{data: inspectorData}];
  particle.$staticInputs = {key, propName: storeName};
  return particle;
},

buildParticleSpecs(nodeType, node, globalStores) {
  const specs = {};
  const names = this.getParticleNames(nodeType) || [];
  for (const particleName of names) {
    specs[`${node.key}${particleName}`] =
        this.buildParticleSpec(nodeType, node, particleName, `main#runner`, globalStores);
  }
  return specs;
},

getParticleNames(recipe) {
  const notKeyword = name => !name.startsWith('$');
  return recipe && keys(recipe).filter(notKeyword);
},

buildParticleSpec(nodeType, node, particleName, defaultContainer, globalStores) {
  const particleSpec = nodeType[particleName];
  const $container = this.resolveContainer(
    node.key,
    particleSpec.$container,
    node.position?.preview?.[`${node.key}${particleName}:Container`]/*?.container*/ || defaultContainer
  );
  const bindings = this.resolveBindings(nodeType, node, particleSpec, globalStores);
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

resolveBindings(nodeType, node, particleSpec, globalStores) {
  const {$inputs, $outputs} = particleSpec;
  return {
    $inputs: this.resolveGroup($inputs, node, nodeType, globalStores),
    $outputs: this.resolveGroup($outputs, node, nodeType, globalStores),
  };
},

resolveGroup(bindings, node, {$stores}, globalStores) {
  return bindings?.map(coded => {
    const {key, binding} = this.decodeBinding(coded);
    const resolutions = this.resolveBinding(binding || key, node, $stores, globalStores);
    return resolutions?.map((resolution, index) => ({[`${key}${index > 0 ? String(index) : ''}`]: resolution}));
  }).flat();
},

resolveBinding(binding, node, $stores, globalStores) {
  const boundStore = $stores?.[binding];
  if (boundStore && !boundStore.connection) {
    return [`${node.key}${this.nameDelim}${binding}`];
  } else {
    const selectedConnections = node.connections?.[binding]?.candidates?.filter(c => c.selected);
    if (selectedConnections) {
      return selectedConnections.map(connection => this.constructStoreId(connection));
    } else {
      const globalCandidate = this.findGlobalCandidate(binding, globalStores);
      if (globalCandidate) {
        return [globalCandidate];
      }
    }
  }
},

buildStoreSpecs(node, nodeType, nodeTypeMap, pipeline) {
  const specs = {};
  const stores = nodeType.$stores || {};
  entries(stores).forEach(([name, store]) => {
    if (store.connection) {
      const connections = this.getStoreConnections(name, node);
      connections.forEach(connection => {
        const spec = this.findGlobalSpec(connection, nodeType)
                  || this.findStoreSpec(connection, pipeline, nodeTypeMap);
        specs[this.constructStoreId(connection)] = {...spec, connection: true};
      });
    } else {
      specs[`${node.key}${this.nameDelim}${name}`] = this.buildStoreSpec(store, node.props?.[name], node);
    }
  });
  return specs;
},

getStoreConnections(storeName, node) {
  return node.connections?.[storeName]?.candidates?.filter(c => c.selected);
},

buildStoreSpec(store, value, node) {
  return {
    ...store,
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

constructStoreId({from, store}) {
  return `${from === 'global' ? '' : `${from}${this.nameDelim}`}${store}`;
},

findGlobalSpec(connection, nodeType) {
  if (connection.from === 'global') {
    return nodeType.$stores[connection.store];
  }
},

findStoreSpec({from, store}, pipeline, nodeTypeMap) {
  const nodeTypeName = pipeline.nodes.find(n => n.key === from)?.name;
  const fromNode = nodeTypeMap[nodeTypeName];
  return fromNode?.$stores?.[store];
},

encodeFullNodeKey({key}, {$meta}, delimiter) {
  return [$meta?.name, key].filter(Boolean).join(delimiter);
},

sanitize(key) {
  return key.replace(/[^A-Za-z0-9]/g, '');
}

});
