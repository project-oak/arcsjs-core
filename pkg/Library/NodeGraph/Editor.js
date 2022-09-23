/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
catalogDelimeter: '$$',
edgeIdDelimeter: '$$',

update({pipeline, selectedNode, nodeTypes}, state) {
  state.nodeTypeMap = mapBy(nodeTypes, n => n?.$meta?.name);
  if (pipeline?.$meta?.name !== state.selectedPipelineName) {
    state.selectedPipelineName = pipeline?.$meta.name;
    // new pipeline, choose a selectedNode if there isn't one
    selectedNode = selectedNode || pipeline?.nodes?.[0];
  }
  selectedNode = this.processPostDuplicationData({selectedNode, pipeline}, state);
  return {
    selectedNode,
    ...this.processPostAddCandidateData({selectedNode, pipeline}, state)
  };
},

/**
 * Post-processes the nodes that were just duplicated from the node graph
 * editor.
 */
processPostDuplicationData({selectedNode, pipeline}, state) {
  const {postDuplicationData: data} = state;
  // Set the newly duplicated nodes as the local selected nodes in graph.
  // Will be `undefined` if `!postDuplicationData`
  state.graphLocalSelectedNodeKeys = data?.graphLocalSelectedNodeKeys;
  // do nothing else without data
  if (data) {
    // Set the main selected node.
    selectedNode = pipeline.nodes.find(
      ({key}) => key === data.newSelectedNodeKey
    );
    state.postDuplicationData = null;
  }
  return selectedNode;
},

/**
 * Post-processes the data for the candidate that was just added when user drops
 * an edge from a node's output onto the empty space in node graph editor.
 */
processPostAddCandidateData({pipeline}, state) {
  if (state.postAddCandidateData) {
    const {newNodeKey, fromKey, fromStore, toStoreType, nodeType} =
        state.postAddCandidateData;
    const node = this.findNodeByKey(newNodeKey, pipeline);
    // Wait for the connections data to be populated.
    if (!node.connections) {
      return;
    }
    // Connect to the first store that matches toStoreType.
    // TODO(b/244191110): Type matching API to be wired here.
    const toStore = keys(nodeType.$stores).find(
      storeName => nodeType.$stores[storeName].$type === toStoreType
    );
    const toConnection = node.connections[toStore].candidates.find(
      candidate => candidate.from === fromKey
    );
    if (!toConnection?.selected) {
      pipeline = this.updateStoreConn(
        pipeline,
        {fromKey, fromStore, toKey: newNodeKey, toStore},
        true
      );
      return {pipeline};
    } else {
      state.postAddCandidateData = undefined;
    }
    // TODO(jingjin): put the runner UI for the just-added candidate node next
    // to its "fromNode".
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

renderGraph(inputs, state) {
  return {
    name: inputs.pipeline?.$meta?.name,
    localSelectedNodeKeys: state.graphLocalSelectedNodeKeys,
    graphNodes: this.renderGraphNodes(inputs, state),
    connectableCandidates: inputs.selectedNode && this.renderConnectableCandidates(inputs, state)
  };
},

renderGraphNodes(inputs, state) {
  const {pipeline} = inputs;
  return pipeline?.nodes?.map(
    node => this.renderNode({node, ...inputs}, state)
  );
},

renderNode({node, categories, pipeline, hoveredNodeKey, selectedNode}, {nodeTypeMap}) {
  const nodeType = nodeTypeMap[node.name];
  const {category} = nodeType?.$meta || {category: 'n/a'};
  const color = this.colorByCategory(category, categories);
  const bgColor = this.bgColorByCategory(category, categories);
  const {x, y} = node.position?.nodegraph || {x: 0, y: 0};
  const hasUI = keys(nodeType).some(key => key.endsWith('___frame'));
  const hiddenUI = node.props?.hideUI === true;
  return {
    key: node.key,
    name: this.nodeDisplay(node),
    displayName: node.displayName,
    position: {x, y},
    color,
    bgColor,
    selected: node.key === selectedNode?.key,
    hovered: node.key === hoveredNodeKey,
    hasUI,
    hiddenUI,
    inputs: this.renderInputs(node, nodeType),
    outputs: this.renderOutputs(nodeType),
    conns: this.renderConnections(node, pipeline),
  };
},

nodeDisplay({name, index}) {
  const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1);
  return `${capitalize(name)}${index > 1 ? ` ${index}` : ''}`;
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
  return this.getStoreConnections(storeName, node)
    .filter(conn => this.findNodeByKey(conn.from, pipeline))
    .map(conn => this.formatConnection(conn.from, conn.store, node.key, storeName))
    ;
},

getStoreConnections(storeName, node) {
  return node.connections[storeName]?.candidates?.filter(c => c.selected) || [];
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

renderConnectableCandidates({selectedNode, nodeTypes, categories}, {nodeTypeMap}) {
  // Store type -> [matching node types grouped by categories]
  const storeTypeToCandidates = {};
  // Go through the selected node's outputs. For each output, find the store
  // type, find the connectable node types for that store type, and group those
  // node types by categories.
  const nodeType = nodeTypeMap[selectedNode?.name];
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
        const candidateNodeTypes = nodeTypes.filter(nodeType => this.isCandidate(nodeType, storeType));
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

renderInputs(node, nodeType) {
  return entries(node.connections || {}).map(([name, connection]) => ({
    name,
    ...connection,
    type: connection.store.$type,
    multiple: connection.store.multiple
  })).filter(({name}) => !nodeType?.$stores[name]?.nodisplay);
},

renderOutputs(nodeType) {
  return entries(nodeType?.$stores || {})
    .filter (([name, store]) => this.isOutput(nodeType, name) && !store.nodisplay)
    .map(([name, store]) => ({name, type: store.$type}))
    ;
},

isOutput(recipe, storeName) {
  const isMatching = (output) => {
    const {key, binding} = this.decodeBinding(output);
    return (binding || key) == storeName;
  };
  return this.getParticles(recipe).some(particle => particle.$outputs?.some(o => isMatching(o)));
},

getParticleNames(recipe) {
  // TODO(mariakleiner): refactor to make iterator for particles in recipe.
  const isKeyword = name => name.startsWith('$');
  return keys(recipe).filter(name => !isKeyword(name));
},

getParticles(recipe) {
  return this.getParticleNames(recipe).map(name => recipe[name]);
},

onNodeRemove({eventlet: {key}, pipeline, selectedNode}) {
  pipeline.nodes = pipeline.nodes.filter(node => node.key !== key);
  return {
    pipeline,
    selectedNode: (key === selectedNode?.key)
      ? null
      : this.findNodeByKey(selectedNode?.key, pipeline)
  };
},

onNodeRenamed({eventlet: {key, value}, pipeline}) {
  const node = pipeline.nodes.find(node => node.key === key);
  node.displayName = value.trim();
  return {pipeline: this.updateNodeInPipeline(node, pipeline)};
},

onNodesDuplicated({eventlet: {value: nodeKeys}, pipeline, selectedNode}, state) {
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
    const newNode = this.duplicateNode(node, pipeline);
    // Update the pipeline with the new node.
    pipeline.nodes = [...pipeline.nodes, newNode];
    // keep the books
    newNodes.push(newNode);
    newNodeKeys.push(newNode.key);
    keyMap[node.key] = newNode.key;
  });

  // Process connections in duplicated nodes to make sure they now connect to
  // duplicated nodes instead of the original nodes..
  // for each node
  newNodes.forEach(({connections}) => {
    // for each connection object
    values(connections).forEach(({candidates}) => {
      // for each candidate
      candidates.forEach(candidate => {
        if (candidate.selected) {
          // If a candidate is selected, and its "from" node is among the
          // current selection, replace the "from" node with its duplication.
          if (nodeKeys.includes(candidate.from)) {
            candidate.from = keyMap[candidate.from];
          }
          // Otherwise, disconnect it.
          else {
            candidate.selected = undefined;
          }
        }
      });
    });
  });

  // Set post-duplication data which will be processed in `update`.
  state.postDuplicationData = {
    newSelectedNodeKey: keyMap[selectedNode.key],
    graphLocalSelectedNodeKeys: newNodeKeys
  };

  return {
    pipeline
  };
},

duplicateNode(node, pipeline) {
  const newNode = this.makeNewNode({$meta: {name: node.name}}, pipeline.nodes);
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

onAddCandidate({eventlet: {value: {fromKey, fromStore, targetStoreType, nodeType, svgX, svgY}}, pipeline}, state) {
  // Add the new node.
  const newNode = this.makeNewNode(nodeType, pipeline.nodes);
  newNode.position = {nodegraph: {x: svgX, y: svgY}};
  pipeline.nodes = [...pipeline.nodes, newNode];

  // Set post-add-candidate data which will be processed in `update` where we
  // do the edge connection. We cannot do it here since the `connections` field
  // of the newly added node has not been populated.
  state.postAddCandidateData = {
    newNodeKey: newNode.key,
    fromKey,
    fromStore,
    toStoreType: targetStoreType,
    nodeType,
  };

  return {
    pipeline,
    selectedNode: newNode
  };
},

onNodeSelect({eventlet: {key}, pipeline}, state) {
  return {selectedNode: this.findNodeByKey(key, pipeline)};
},

onNodeTypeDropped({eventlet: {key, value}, pipeline}, {nodeTypeMap}) {
  if (pipeline) {
    // When a node type is dropped onto node-graph-editor, create a new node,
    // and set its svg position (nodegraph: {x, y}).
    const name = key.split(this.catalogDelimeter)[1];
    const {svgPoint} = value;
    const nodeType = nodeTypeMap[name];
    const newNode = this.makeNewNode(nodeType, pipeline.nodes);
    newNode.position = {nodegraph: {x: svgPoint.x, y: svgPoint.y}};
    pipeline.nodes = [...pipeline.nodes, newNode];
    return {
      pipeline,
      selectedNode: newNode
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
  const connection = node.connections[toStore];
  const index = connection.candidates.findIndex(({from, store}) => from === fromKey && store === fromStore);
  node = {
    ...node,
    connections: {
      ...node.connections,
      [toStore]: {
        ...node.connections[toStore],
        candidates: assign([], connection.candidates, {
          [index]: {...connection.candidates[index], selected: isSelected}
        })
      }
    }
  };
  return this.updateNodeInPipeline(node, pipeline);
},

updateNodeInPipeline(node, pipeline) {
  const index = pipeline.nodes.findIndex(n => n.key === node.key);
  pipeline.nodes = assign([], pipeline.nodes, {[index]: node});
  return pipeline;
},

makeNewNode({$meta: {name}}, nodes) {
  const typedNodes = nodes.filter(node => name === node.name);
  const index = (typedNodes[typedNodes.length - 1]?.index || 0) + 1;
  return {
    name,
    index,
    key: this.formatNodeKey({name, index}),
  };
},

formatNodeKey({name, index}) {
  return `${name}${index}`.replace(/ /g,'');
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
