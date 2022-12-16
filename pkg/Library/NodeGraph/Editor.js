/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
catalogDelimeter: '$$',
edgeIdDelimeter: '$$',
connectionDelimiter: ':',

async update(inputs, state) {
  const {graph} = inputs;
  state.graph = this.parseGraph(graph);
  const results = this.handleEvents(inputs, state);
  return {
    ...results,
    editorToolbarIcons: this.toolbarIcons(inputs, state)
  };
},

parseGraph(graph) {
  try {
    const graphObj = typeof graph === 'string' ? JSON.parse(graph) : graph;
    return this.finalizeGraph(graphObj);
  } catch(x) {
    return null;
  }
},

finalizeGraph(graph) {
  entries(graph?.nodes).forEach(([id, node]) => {
    node.id = id;
    node.displayName = node.displayName || node.id;
  });
  return graph;
},

handleEvents(inputs, state) {
  const {event} = inputs;
  if (event !== state.event) {
    state.event = event;
    if (event) {
      const result = this.handleEvent(inputs, state);
      if (keys(result).length > 0) {
        return result;
      }
    }
  }
},

handleEvent(inputs, state) {
  const {event, selectedNodeId} = inputs;
  if (this[event]) {
    return {
      ...this[event](inputs, state),
      event: null
    };
  }
  log(`Unhandled event '${event}' for ${selectedNodeId}`);
},

toolbarIcons({selectedNodeId}, {graph}) {
  if (keys(graph?.nodes).length === 0) {
    return [];
  }
  const hasSelectedNode = Boolean(selectedNodeId);
  return [{
    icon: 'delete',
    title: 'Delete node',
    key: 'deleteSelectedNode',
    disabled: !hasSelectedNode
  }, {
    icon: 'content_copy',
    title: 'Duplicate node',
    key: 'duplicateSelectedNode',
    disabled: !hasSelectedNode
  }, {
    icon: 'drive_file_rename_outline',
    title: 'Rename node',
    key: 'renameSelectedNode',
    disabled: !hasSelectedNode
  }];
},

render(inputs, state) {
  const {graph, layoutId} = inputs;
  return {
    graph: this.renderGraph(inputs, state),
    graphRects: graph?.layout?.[layoutId]
  };
},

renderGraph(inputs, state) {
  return {
    name: state.graph?.$meta?.name,
    graphNodes: this.renderGraphNodes(inputs, state),
    graphEdges: this.renderGraphEdges(inputs, state)
  };
},

renderGraphNodes(inputs, state) {
  const {graph} = state;
  return values(graph?.nodes).map(node => this.renderNode(node, inputs, state));
},

renderNode(node, {graph, categories, selectedNodeId, nodeTypes, layoutId}) {
  const nodeType = nodeTypes[node.type];
  const layout = graph.layout?.[layoutId];
  const {category} = nodeType?.$meta || {category: 'n/a'};
  return {
    key: node.id,
    name: node.displayName,
    displayName: node.displayName,
    position: layout?.[node.id] || {x: 0, y: 0},
    // TODO(mariakleiner): node-graph doesn't get updated, if nodeType (and hence color)
    // for a customNode was loaded after the node was rendered
    color: this.colorByCategory(category, categories),
    bgColor: this.bgColorByCategory(category, categories),
    selected: node.id === selectedNodeId,
    inputs: this.renderInputs(node, nodeType),
    outputs: this.renderOutputs(nodeType),
  };
},

renderGraphEdges(inputs, {graph}) {
  const {categories} = inputs;
  const edges = [];
  values(graph?.nodes).forEach(node => {
    const connects = entries(node.connections).map(
      ([name, connects]) => connects.map(conn => {
        const {from, storeName} = this.parseConnection(conn);
        return {from, storeName, toStoreName: name};
      })).flat();
    connects.forEach(connect => edges.push({
      from: {
        id: connect.from,
        storeName: connect.storeName
      },
      to: {
        id: node.id,
        storeName: connect.toStoreName
      },
      color: this.colorByCategory('todo', categories)
    }));
  });
  return edges;
},

parseConnection(connection) {
  const [from, storeName] = connection.split(this.connectionDelimiter);
  return {from, storeName};
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

renderInputs(node, nodeType) {
  return this.getInputStores(nodeType).map(([name, store]) => ({
    name,
    ...(node.connections?.[name] || {}),
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
  return bindings?.some(binding => this.isMatchingStore(storeName, binding));
},

isMatchingStore(storeName, connection) {
  const {key, binding} = this.decodeBinding(connection);
  return (binding || key) == storeName;
},

decodeBinding(value) {
  if (typeof value === 'string') {
    return {key: value, binding: ''};
  } else {
    const [key, binding] = entries(value)[0];
    return {key, binding};
  }
},

getParticleNames(nodeType) {
  // TODO(mariakleiner): refactor to make iterator for particles in recipe.
  const isKeyword = name => name.startsWith('$');
  return keys(nodeType).filter(name => !isKeyword(name));
},

getParticles(nodeType) {
  return this.getParticleNames(nodeType).map(name => nodeType[name]);
},

onNodeRemove({eventlet: {key}, selectedNodeId}, {graph}) {
  return this.deleteNode(key, graph, selectedNodeId);
},

onNodeRenamed({eventlet: {key, value}}, state) {
  // TODO(mariakleiner): renaming doesn't work, when triggered from the menu.
  const node = state.graph.nodes[key];
  node.displayName = value.trim();
  state.graph.nodes[node.id] = node;
  delete state.selectedNodeText;
  return {graph: state.graph};
},

renameSelectedNode({selectedNodeId}, state) {
  state.selectedNodeText = selectedNodeId;
},

deleteSelectedNode({selectedNodeId}, {graph}) {
  return this.deleteNode(selectedNodeId, graph, selectedNodeId);
},

deleteNode(nodeId, graph, selectedNodeId) {
  delete graph.nodes[nodeId];
  keys(graph.layout).forEach(layoutId => {
    delete graph.layout[layoutId][nodeId];
  });
  return {
    graph,
    selectedNodeId: (nodeId === selectedNodeId) ? null : selectedNodeId
  };
},

duplicateSelectedNode({selectedNodeId, newNodeInfos}, {graph}) {
  if (graph && selectedNodeId) {
    const {type, displayName, props, connections} = graph.nodes[selectedNodeId];
    const newInfo = {
      type,
      nodeData: {
        displayName: this.duplicateDisplayName(displayName, graph),
        props: {...props},
        connections: JSON.parse(JSON.stringify(connections))
      }
    };
    return {
      newNodeInfos: [...(newNodeInfos || []), newInfo]
    };
  }
},

duplicateDisplayName(displayName, graph) {
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
    if (!values(graph.nodes).find(n => n.displayName === newParts.join(' '))) {
      parts = newParts;
      break;
    }
    c++;
  }
  return parts.join(' ');
},

// onAddCandidate({eventlet: {value: {fromKey, fromStore, targetStoreType, nodeType, svgX, svgY}}, graph, nodeTypes, layout}) {
//   // Add the new node.
//   const newNode = this.makeNewNode(nodeType, graph.nodes, nodeTypes);
//   // Connect to the first store that matches toStoreType.
//   // TODO(b/244191110): Type matching API to be wired here.
//   const toStore = this.getInputStores(nodeType)
//     .find(([_, store]) => store.$type === targetStoreType)[0];
//   newNode.connections = {[toStore]: [{from: fromKey, storeName: fromStore}]};
//   // graph.nodes = [...graph.nodes, newNode];
//   graph.nodes[newNode.id] = newNode;
//   return {
//     graph,
//     selectedNodeId: newNode.id,
//     layout: {...layout, [newNode.id]: {x: svgX, y: svgY}}
//   };
// },

onNodeSelect({eventlet: {key}}) {
  return {selectedNodeId: key};
},

onNodeTypeDropped({eventlet: {value: {id: type, position}}, newNodeInfos, layoutId}, {graph}) {
  if (graph) {
    return {
      newNodeInfos: [...(newNodeInfos || []), {
        type,
        [layoutId]: position
      }]
    };
  }
},

onNodeMoved({eventlet: {key, value}, graph, layoutId}) {
  graph.layout ??= {};
  graph.layout[layoutId] ??= {};
  if (graph.nodes[key]) {
    graph.layout[layoutId][key] = value;
    return {graph};
  }
},

// onEdgeRemove({eventlet: {key}, graph}) {
//   const [fromKey, fromStore, toKey, toStore] = key.split(this.edgeIdDelimeter);
//   return {
//     graph: this.updateStoreConn(graph, {fromKey, fromStore, toKey, toStore}, false)
//   };
// },

// onEdgeConnected({eventlet: {value}, graph}) {
//   return {
//     graph: this.updateStoreConn(graph, value, true)
//   };
// },

// updateStoreConn(graph, {fromKey, fromStore, toKey, toStore}, isSelected) {
//   let node = graph.nodes[toKey];
//   node = {
//     ...node,
//     connections: {...(node.connections || {}), [toStore]: [...(node.connections?.[toStore] || [])]}
//   };
//   if (isSelected) {
//     node.connections[toStore].push({from: fromKey, storeName: fromStore});
//   } else {
//     delete node.connections[toStore];
//   }
//   graph.nodes[node.id] = node;
//   return graph;
// },

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
  [frame="toolbar"] {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>

<div flex rows>
  <div flex grid scrolling>
    <drop-target flex row on-target-drop="onNodeTypeDropped">
      <node-graph flex
          graph="{{graph}}"
          rects="{{graphRects}}"
          on-nodetype-dropped="onNodeTypeDropped"
          on-node-moved="onNodeMoved"
          on-node-selected="onNodeSelect"
          Xon-node-hovered="onNodeHovered"
          Xon-node-deleted="onNodeRemove"
          on-node-renamed="onNodeRenamed"
          Xon-nodes-duplicated="onNodesDuplicated"
          Xon-add-candidate="onAddCandidate"
          Xon-edge-deleted="onEdgeRemove"
          Xon-edge-connected="onEdgeConnected">
      </node-graph>
    </drop-target>
  </div>
  <div frame="toolbar"></div>
</div>
`
});