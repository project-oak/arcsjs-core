/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
catalogDelimeter: '$$',
edgeIdDelimeter: '$$',

update({pipeline, selectedNodeKey}, state) {
  if (pipeline?.$meta?.name !== state.selectedPipelineName) {
    state.selectedPipelineName = pipeline?.$meta.name;
    // new pipeline, choose a selectedNode if there isn't one
    if (!selectedNodeKey) {
      return {selectedNodeKey: pipeline?.nodes?.[0]?.key};
    }
  }
},

findNodeByKey(key, {nodes}) {
  return nodes.find(node => node.key === key) ?? null;
},

decodeBinding(value) {
  if (typeof value === 'string') {
    return {key: value, binding: ''};
  } else {
    const [key, binding] = entries(value)[0];
    return {key, binding};
  }
},

render(inputs, state) {
  return {
    graph: this.renderGraph(inputs, state)
  };
},

renderGraph(inputs) { // , state) {
  return {
    name: inputs.pipeline?.$meta?.name,
    // localSelectedNodeKeys: state.graphLocalSelectedNodeKeys,
    graphNodes: this.renderGraphNodes(inputs),
    connectableCandidates: inputs.selectedNodeKey && this.renderConnectableCandidates(inputs)
  };
},

renderGraphNodes(inputs) {
  const {pipeline} = inputs;
  return pipeline?.nodes?.map(
    node => this.renderNode({node, ...inputs}) //, state)
  );
},

renderNode({node, categories, pipeline, hoveredNodeKey, selectedNodeKey, candidates, nodeTypes}) {
  const nodeType = nodeTypes[node.type];
  const {category} = nodeType?.$meta || {category: 'n/a'};
  const color = this.colorByCategory(category, categories);
  const bgColor = this.bgColorByCategory(category, categories);
  // >>>> const {x, y} = node.position?.nodegraph || {x: 0, y: 0};
  const {x, y} = node.position?.nodegraph || {x: node.key.length * 40 , y: node.key.length * 10};
  const hasUI = keys(nodeType).some(key => key.endsWith('___frame'));
  const hiddenUI = node.props?.hideUI === true;
  return {
    key: node.key,
    name: this.nodeDisplay(node),
    displayName: node.displayName,
    position: {x, y},
    color,
    bgColor,
    selected: node.key === selectedNodeKey,
    hovered: node.key === hoveredNodeKey,
    hasUI,
    hiddenUI,
    inputs: this.renderInputs(node, nodeType, candidates),
    outputs: this.renderOutputs(nodeType),
    conns: this.renderConnections(node, pipeline),
  };
},

nodeDisplay(node) {
  return node.displayName || node.name;
},

colorByCategory(category, categories) {
  return categories?.[category]?.color || 'crimson';
},

bgColorByCategory(category, categories) {
  return categories?.[category]?.bgColor || 'lightgrey';
},

iconByCategory(category, categories) {
  return categories?.[category]?.icon || 'star_outline';
},

renderConnections(node, pipeline) {
  return keys(node.connections)
    .map(storeName => this.renderStoreConnections(storeName, node, pipeline))
    .flat()
    ;
},

renderStoreConnections(storeName, node, pipeline) {
  return node.connections[storeName]
    .filter(conn => this.findNodeByKey(conn.from, pipeline))
    .map(conn => this.formatConnection(conn.from, conn.storeName, node.key, storeName))
    ;
},

formatConnection(fromKey, fromStore, toKey, toStore) {
  return {
    fromKey,
    fromStore,
    toKey,
    toStore,
    id: [fromKey, fromStore, toKey, toStore].join(this.edgeIdDelimeter)
  };
},

renderConnectableCandidates({selectedNodeKey, pipeline, nodeTypes, categories}) { //, {nodeTypeMap}) {
  // Store type -> [matching node types grouped by categories]
  const storeTypeToCandidates = {};
  // Go through the selected node's outputs. For each output, find the store
  // type, find the connectable node types for that store type, and group those
  // node types by categories.
  const selectedNode = pipeline.nodes.find(node => node.key === selectedNodeKey);
  const nodeType = nodeTypes[selectedNode?.type]; //name];
  const particles = this.getParticles(nodeType);
  for (const particle of particles) {
    for (const output of particle.$outputs || []) {
      // Find the store type for the output.
      let storeName = output;
      if (typeof output === 'object') {
        storeName = values(output)[0];
      }
      const storeType = nodeType.$stores[storeName]?.$type;
      // Find and group connectable candidates.
      if (storeType && !storeTypeToCandidates[storeType]) {
        const candidateNodeTypes = values(nodeTypes).filter(nodeType => this.isCandidate(nodeType, storeType));
        storeTypeToCandidates[storeType] =
          this.groupNodeTypesByCategories(candidateNodeTypes, categories);
      }
    }
  }
  return storeTypeToCandidates;
},

isCandidate(nodeType, storeType) {
  const names = this.getParticleNames(nodeType);
  const matches = input => {
    const {key, binding} = this.decodeBinding(input);
    const store = nodeType.$stores[binding || key];
    // TODO(sjmiles): what if store doesn't exist?
    // TODO(b/244191110): Type matching API to be wired here.
    return storeType === store?.$type && store?.connection;
  };
  return names.some(
    name => nodeType[name].$inputs?.some(input => matches(input))
  );
},

groupNodeTypesByCategories(nodeTypes, categories) {
  const groups = [];
  for (const nodeType of nodeTypes) {
    const category = nodeType.$meta.category;
    const group = this.requireGroup(groups, category, categories);
    group.nodeTypes.push(nodeType);
  }
  return groups;
},

requireGroup(groups, category, categories) {
  return groups.find(group => group.category === category)
      || this.createGroup(groups, category, categories);
},

createGroup(groups, category, categories) {
  const group = {
    category,
    icon:  this.iconByCategory(category, categories),
    color: this.colorByCategory(category, categories),
    nodeTypes: []
  };
  groups.push(group);
  return group;
},

findInput({$inputs}, name) {
  const input = $inputs?.find(input => {
    const {key, binding} = this.decodeBinding(input);
    return key === name || binding === name;
  });
  return input && this.decodeBinding(input).binding;
},

renderInputs(node, nodeType, candidates) {
  return this.getInputStores(nodeType).map(([name, store]) => ({
    name,
    ...(node.connections?.[name] || {}),
    candidates: candidates?.[node.key]?.[name] || [],
    type: store.$type,
    multiple: store.multiple
  }));
},

getInputStores(nodeType) {
  return entries(nodeType?.$stores).filter(([name, store]) => this.isInput(nodeType, name) && !store.nodisplay);
},

isInput(nodeType, storeName) {
  return this.getParticles(nodeType).some(particle => this.hasMatchingStore(particle.$inputs, storeName));
},

renderOutputs(nodeType) {
  return this.getOutputStores(nodeType).map(([name, store]) => ({name, type: store.$type}));
},

getOutputStores(nodeType) {
  return entries(nodeType?.$stores).filter(([name, store]) => this.isOutput(nodeType, name) && !store.nodisplay);
},

isOutput(nodeType, storeName) {
  return this.getParticles(nodeType).some(particle => this.hasMatchingStore(particle.$outputs, storeName));
},

hasMatchingStore(bindings, storeName) {
  return bindings?.some(binding => this.isMatchingStore(storeName, binding))
},

isMatchingStore(storeName, connection) {
  const {key, binding} = this.decodeBinding(connection);
  return (binding || key) == storeName;
},

getParticleNames(nodeType) {
  // TODO(mariakleiner): refactor to make iterator for particles in recipe.
  const isKeyword = name => name.startsWith('$');
  return keys(nodeType).filter(name => !isKeyword(name));
},

getParticles(nodeType) {
  return this.getParticleNames(nodeType).map(name => nodeType[name]);
},

onNodeRemove({eventlet: {key}, pipeline, selectedNodeKey}) {
  pipeline.nodes = pipeline.nodes.filter(node => node.key !== key);
  return {
    pipeline,
    selectedNodeKey: (key === selectedNodeKey) ? null : selectedNodeKey
  };
},

onNodeRenamed({eventlet: {key, value}, pipeline}) {
  // >>> TODO START HERE STARTHERE VERIFY IT WORKS!
  const node = pipeline.nodes.find(node => node.key === key);
  node.displayName = value.trim();
  return {pipeline: this.updateNodeInPipeline(node, pipeline)};
},

onNodesDuplicated({eventlet: {value: nodeKeys}, pipeline, selectedNodeKey, nodeTypes}, state) {
  // Keys for duplicated nodes.
  const newNodeKeys = [];
  // A map from original node key to its duplicated node key.
  const keyMap = {};

  // Duplicate currently selected nodes.
  //
  const nodes = pipeline.nodes.filter(node => nodeKeys.includes(node.key));
  const newNodes = [];
  nodes.forEach(node => {
    // Duplicate the node.
    const newNode = this.duplicateNode(node, pipeline, nodeTypes);
    // Update the pipeline with the new node.
    pipeline.nodes = [...pipeline.nodes, newNode];
    // keep the books
    newNodes.push(newNode);
    newNodeKeys.push(newNode.key);
    keyMap[node.key] = newNode.key;
  });

  // Connect duplicated nodes to duplicated nodes (instead of the original ones).
  newNodes.forEach(({connections}) => {
    values(connections).forEach(options => {
      options.forEach(connection => connection.from = keyMap[connection.from]);
    });
  });

  return {
    pipeline,
    selectedNodeKey: keyMap[selectedNodeKey]
  };
},

duplicateNode(node, pipeline, nodeTypes) {
  const newNode = this.makeNewNode(nodeTypes[node.type], pipeline.nodes);
  // Copy props.
  if (node.props) {
    newNode.props = {...node.props};
  }
  // Copy connections.
  if (node.connections) {
    newNode.connections = JSON.parse(JSON.stringify(node.connections));
  }
  // In node editor, put the duplicated node below the original node.
  newNode.position = {...node.position, nodegraph: {...node.position.nodegraph, y: node.position.nodegraph.y + 60}};
  // In runner, put the duplicated particle below the original particle.
  if (newNode.position.preview) {
    newNode.position.preview = this.duplicatePreviewPosition(
        newNode.position.preview, node.key, newNode.key);
  }
  // Update display name if necessary.
  if (node.displayName) {
    newNode.displayName = this.duplicateDisplayName(node.displayName, pipeline);
  }
  return newNode;
},

duplicatePreviewPosition(preview, oldNodeKey, newNodeKey, offsetY = 16) {
  const newPreview = {};
  keys(preview).forEach(id => {
    const newId = id.replace(oldNodeKey, newNodeKey);
    const position = {...preview[id]};
    position.t = position.t + position.h + offsetY;
    newPreview[newId] = position;
  });
  return newPreview;
},

duplicateDisplayName(displayName, pipeline) {
  // Mimic the way how macOS names the duplicated files:
  //
  // - Append "copy" if the name doesn't end with copy.
  // - If the name ends withh "copy", append "2".
  // - If the name ends with "copy" + a number, increment the number.
  // Do the steps above until a unique name is found.
  let parts = displayName.split(' ');
  const lastPart = parts[parts.length - 1];
  let c = 1;
  if (parts.length >= 2 && !isNaN(lastPart) &&
      parts[parts.length - 2] === 'copy') {
    c = Number(lastPart) + 1;
  } else if (lastPart === 'copy') {
    c = 2;
  }
  let newParts = [...parts];
  while (c > 0) {
    if (c === 1) {
      newParts.push('copy');
    } else if (c === 2) {
      newParts.push(c);
    } else {
      newParts[newParts.length - 1] = c;
    }
    if (!pipeline.nodes.find(n => n.displayName === newParts.join(' '))) {
      parts = newParts;
      break;
    }
    c++;
  }
  return parts.join(' ');
},

onAddCandidate({eventlet: {value: {fromKey, fromStore, targetStoreType, nodeType, svgX, svgY}}, pipeline, nodeTypes}, state) {
  // Add the new node.
  const newNode = this.makeNewNode(nodeType, pipeline.nodes, nodeTypes);
  newNode.position = {nodegraph: {x: svgX, y: svgY}};
  // Connect to the first store that matches toStoreType.
  // TODO(b/244191110): Type matching API to be wired here.
  const toStore = this.getInputStores(nodeType)
    .find(([_, store]) => store.$type === targetStoreType)[0];
  newNode.connections = {[toStore]: [{from: fromKey, storeName: fromStore}]};
  pipeline.nodes = [...pipeline.nodes, newNode];
  return {
    pipeline,
    selectedNodeKey: newNode.key
  };
},

onNodeSelect({eventlet: {key}}) {
  return {selectedNodeKey: key};
},

onNodeTypeDropped({eventlet: {key, value}, pipeline, nodeTypes}) {
  if (pipeline) {
    // When a node type is dropped onto node-graph-editor, create a new node,
    // and set its svg position (nodegraph: {x, y}).
    // const name = key.split(this.catalogDelimeter)[1];
    const {svgPoint} = value;
    const newNode = this.makeNewNode(nodeTypes[key], pipeline.nodes, nodeTypes);
    newNode.position = {nodegraph: {x: svgPoint.x, y: svgPoint.y}};
    pipeline.nodes = [...pipeline.nodes, newNode];
    return {
      pipeline,
      selectedNodeKey: newNode.key
    };
  }
},

onNodeMoved({eventlet: {key, value}, pipeline}) {
  if (pipeline) {
    // When a node is moved, update its nodegraph's x and y value.
    const {x, y} = value;
    let node = this.findNodeByKey(key, pipeline);
    node = {...node, position: {...node.position, nodegraph: {x, y}}};
    return {
      pipeline: this.updateNodeInPipeline(node, pipeline)
    };
  }
},

onNodeHovered({eventlet: {key}}) {
  return {
    hoveredNodeKey: key
  };
},

onEdgeRemove({eventlet: {key}, pipeline}) {
  const [fromKey, fromStore, toKey, toStore] = key.split(this.edgeIdDelimeter);
  return {
    pipeline: this.updateStoreConn(pipeline, {fromKey, fromStore, toKey, toStore}, false)
  };
},

onEdgeConnected({eventlet: {value}, pipeline}) {
  return {
    pipeline: this.updateStoreConn(pipeline, value, true)
  };
},

updateStoreConn(pipeline, {fromKey, fromStore, toKey, toStore}, isSelected) {
  let node = this.findNodeByKey(toKey, pipeline);
  node = {
    ...node,
    connections: {...(node.connections || {}), [toStore]: [...(node.connections?.[toStore] || [])]}
  };
  if (isSelected) {
    node.connections[toStore].push({from: fromKey, storeName: fromStore});
  } else {
    delete node.connections[toStore];
  }
  return this.updateNodeInPipeline(node, pipeline);
},

updateNodeInPipeline(node, pipeline) {
  const index = pipeline.nodes.findIndex(n => n.key === node.key);
  pipeline.nodes = assign([], pipeline.nodes, {[index]: node});
  return pipeline;
},

makeNewNode({$meta: {key, name}}, nodes) {
  const index = this.indexNewNode(key, nodes);
  return {
    type: key,
    index,
    key: this.formatNodeKey(key, index),
    name: this.displayName(name, index)
  };
},

indexNewNode(key, nodes) {
  const typedNodes = nodes.filter(node => key === node.type);
  return (typedNodes.length ? typedNodes[typedNodes.length - 1].index : 0) + 1;
},

displayName(name, index) {
  const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1);
  return `${capitalize(name)}${index > 1 ? ` ${index}` : ''}`;
},

formatNodeKey(key, index) {
  return `${key}${index}`.replace(/ /g,'');
},

template: html`
<style>
  :host {
    color: black;
    background-color: var(--theme-color-bg-1);
    display: block;
    height: 100%;
    font-size: 12px;
    --edge-border: 1px solid #555;
    --mdc-icon-size: 18px;
    --mdc-icon-button-size: 26px;
  }
  mwc-icon-button {
    color: #555;
  }
  [node] {
    border: var(--edge-border);
    background: #fdfdfd;
    cursor: pointer;
    margin: 14px 20px;
    min-width: 100px;
    border-radius: 6px;
    overflow: hidden;
  }
  [node][selected] {
    margin: 12px 18px;
    border-width: 3px;
  }
  [category="input"] {
    background-color: #e9f2e4;
    border-color: green;
  }
  [category="model"] {
    background-color: #fbe5c2;
    border-color: orange;
  }
  [category="effect"] {
    background-color: #e7d2fc;
    border-color: purple;
  }
  [category="output"] {
    background-color: #c8d8f5;
    border-color: blue;
  }
  [category="misc"] {
    background-color: lightgrey;
    border-color: grey;
  }
</style>
<div flex grid scrolling>
  <node-graph-editor
      graph="{{graph}}"
      on-nodetype-dropped="onNodeTypeDropped"
      on-node-moved="onNodeMoved"
      on-node-hovered="onNodeHovered"
      on-node-selected="onNodeSelect"
      on-node-deleted="onNodeRemove"
      on-node-renamed="onNodeRenamed"
      on-nodes-duplicated="onNodesDuplicated"
      on-add-candidate="onAddCandidate"
      on-edge-deleted="onEdgeRemove"
      on-edge-connected="onEdgeConnected">
  </node-graph-editor>
</div>
`
});
