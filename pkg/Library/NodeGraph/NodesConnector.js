/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

connectorDelimiter: '$$',

shouldUpdate({nodeTypes}) {
  return !nodeTypes.empty;
},

update(inputs, state) {
  const {pipeline} = inputs;
  if (pipeline?.nodes && this.nodesDidChange(pipeline.nodes, state.nodes)) {
    state.nodes = [...pipeline.nodes];
    return this.updateNodes(inputs, state);
  }
},

nodesDidChange(nodes, currentNodes) {
  if (nodes?.length === currentNodes?.length) {
    return !currentNodes?.every(node => this.hasSameNode(node, nodes));
  }
  return true;
},

updateNodes({pipeline, selectedNode, nodeTypes, customInspectors, inspectorData, globalStores}) {
  pipeline.nodes = pipeline.nodes.map(node => this.updateNodeConnectionCandidates(node, pipeline, nodeTypes, globalStores));
  const recipes = pipeline.nodes
    .map(node => this.recipeForNode(node, nodeTypes, pipeline, customInspectors, inspectorData || 'inspectorData'))
    .filter(recipe => recipe)
    ;
  return {
    pipeline,
    recipes,
    selectedNode: pipeline.nodes.find(n => n.key === selectedNode?.key),
  };
},

hasSameNode(node, nodes) {
  const nodeInNodes = nodes.find(({key}) => key === node.key);
  return nodeInNodes && JSON.stringify(nodeInNodes) === JSON.stringify(node);
},

updateNodeConnectionCandidates(node, pipeline, nodeTypes, globalStores) {
  const connections = this.updateNodeStoreConnections(node, pipeline, nodeTypes, globalStores);
  return {
    ...node,
    ...(keys(connections).length > 0 && {connections})
  };
},

updateNodeStoreConnections(node, pipeline, nodeTypes, globalStores) {
  const connections = {};
  const nodeType = this.findNodeType(node.name, nodeTypes);
  nodeType?.$stores && entries(nodeType.$stores).forEach(([storeName, store]) => {
    if (store.connection) {
      const bindings = this.findStoreBindings(storeName, nodeType);
      const candidates = this.findConnectionCandidates(storeName, store, bindings, node, pipeline, nodeTypes, globalStores);
      connections[storeName] = {store, bindings, candidates};
    }
  });
  return connections;
},

findConnectionCandidates(storeName, {$type}, bindings, node, {nodes}, nodeTypes, globalStores) {
  if (this.findGlobalCandidate(storeName, globalStores)) {
    return [{from: 'global', store: storeName, type: $type, selected: true}];
  }
  const candidates = [];
  nodes.forEach(n => {
    const candidate = this.findCandidateInNode($type, n, nodeTypes);
    if (candidate && candidate.from !== node.key) {
      if (node.connections) {
        candidate.selected = node.connections[storeName].candidates.find(({from, store}) => from === candidate.from && store === candidate.store)?.selected;
      }
      candidates.push(candidate);
    }
  });
  // Set default connection.
  if (!node.connections && candidates.length === 1 && bindings?.length > 0) {
    candidates[0].selected = true;
  }
  return candidates;
},

findGlobalCandidate(storeName, globalStores) {
  return globalStores?.find(name => name === storeName);
},

findCandidateInNode(type, node, nodeTypes) {
  const nodeType = this.findNodeType(node.name, nodeTypes);
  if (nodeType) {
    const store = this.findMatchingStore(type, nodeType.$stores);
    if (store) {
      return ({from: node.key, store: store.name, type: store.$type});
    }
  }
},

findMatchingStore(type, stores) {
  const matchingType = (storeType) => {
    return storeType === type;
  };
  const matchingStore = (store) => matchingType(store.$type) && !store.connection;
  const name = stores && keys(stores).find(name => matchingStore(stores[name]));
  if (name) {
    return {name, ...stores[name]};
  }
},

findStoreBindings(store, recipe) {
  const bindings = [];
  this.particleNames(recipe).forEach(particleName =>  {
    this.addInputBindings(store, recipe, particleName, bindings);
  });
  return bindings;
},

particleNames(nodeType) {
  const isKeyword = name => name.startsWith('$');
  return keys(nodeType).filter(name => !isKeyword(name));
},

addInputBindings(store, recipe, particleName, bindings) {
  const {$inputs} = recipe[particleName];
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

findNodeType(name, nodeTypes) {
  return nodeTypes.find(({$meta}) => $meta.name === name);
},

recipeForNode(node, nodeTypes, pipeline, customInspectors, inspectorData) {
  const nodeType = this.findNodeType(node.name, nodeTypes);
  const recipe = this.buildParticleSpecs(nodeType, node);
  recipe.$meta = {
    name: this.encodeFullNodeKey(node, pipeline, this.connectorDelimiter)
  };
  if (nodeType?.$stores) {
    recipe.$stores = this.buildStoreSpecs(node, nodeType, nodeTypes, pipeline);
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

buildParticleSpecs(nodeType, node) {
  const specs = {};
  const names = this.getParticleNames(nodeType) || [];
  for (const particleName of names) {
    specs[`${node.key}${particleName}`] = this.buildParticleSpec(nodeType, node, particleName);
  }
  return specs;
},

getParticleNames(recipe) {
  const notKeyword = name => !name.startsWith('$');
  return recipe && keys(recipe).filter(notKeyword);
},

buildParticleSpec(nodeType, node, particleName) {
  const particleSpec = nodeType[particleName];
  const $container = this.resolveContainer(node.key, particleSpec.$container);
  const bindings = this.resolveBindings(nodeType, node, particleSpec);
  return {
    $slots: {},
    ...particleSpec,
    ...bindings,
    $container
  };
},

resolveContainer(nodeName, containerName) {
  return containerName ? `${nodeName}${containerName}` : `main#runner`;
},

resolveBindings(nodeType, node, particleSpec) {
  const {$inputs, $outputs} = particleSpec;
  return {
    $inputs: this.resolveGroup($inputs, node, nodeType),
    $outputs: this.resolveGroup($outputs, node, nodeType),
  };
},

resolveGroup(bindings, node, {$stores}) {
  return bindings?.map(coded => {
    const {key, binding} = this.decodeBinding(coded);
    const resolutions = this.resolveBinding(binding || key, node, $stores);
    return resolutions?.map((resolution, index) => ({[`${key}${index > 0 ? String(index) : ''}`]: resolution}));
  }).flat();
},

resolveBinding(binding, node, $stores) {
  const boundStore = $stores?.[binding];
  if (boundStore && !boundStore.connection) {
    return [`${node.key}${binding}`];
  } else {
    const selectedConnections = node.connections?.[binding]?.candidates?.filter(c => c.selected);
    return selectedConnections?.map(connection => this.constructStoreId(connection));
  }
},

buildStoreSpecs(node, nodeType, nodeTypes, pipeline) {
  const specs = {};
  const stores = nodeType.$stores || {};
  entries(stores).forEach(([name, store]) => {
    if (store.connection) {
      const connections = this.getStoreConnections(name, node);
      connections.forEach(connection => {
        const spec = this.findGlobalSpec(connection, nodeType)
                  || this.findStoreSpec(connection, pipeline, nodeTypes);
        specs[this.constructStoreId(connection)] = {...spec, connection: true};
      });
    } else {
      specs[`${node.key}${name}`] = this.buildStoreSpec(store, node.props?.[name], node);
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
  return `${from === 'global' ? '' : from}${store}`;
},

findGlobalSpec(connection, nodeType) {
  if (connection.from === 'global') {
    return nodeType.$stores[connection.store];
  }
},

findStoreSpec({from, store}, pipeline, nodeTypes) {
  const nodeTypeName = pipeline.nodes.find(n => n.key === from)?.name;
  const fromNode = this.findNodeType(nodeTypeName, nodeTypes);
  return fromNode?.$stores?.[store];
},

encodeFullNodeKey({key}, {$meta}, delimiter) {
  return [$meta?.name, key].filter(Boolean).join(delimiter);
},

sanitize(key) {
  return key.replace(/[^A-Za-z0-9]/g, '');
}

});
