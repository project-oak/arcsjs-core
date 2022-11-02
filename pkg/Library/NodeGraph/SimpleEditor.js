/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
catalogDelimiter: '$$',

update({graph, selectedNodeId}, state) {
  if (graph?.$meta?.name !== state.selectedPipelineName) {
    state.selectedPipelineName = graph?.$meta.name;
    selectedNodeId = null;
  }
  if (!selectedNodeId && keys(graph?.nodes).length) {
    selectedNodeId = keys(graph.nodes)[0];
  }
  return {selectedNodeId};
},

render({graph, nodeTypes, categories, selectedNodeId}) {
  return {
    graphNodes: this.renderGraphNodes(graph?.nodes, selectedNodeId, nodeTypes, categories),
  };
},

renderGraphNodes(nodes, selectedNodeId, nodeTypes, categories) {
  const graph = {name: 'graph', children: []};
  const graphNodes = values(nodes).map(node => {
    const nodeType = nodeTypes[node.type];
    const category = nodeType?.$meta?.category;
    return {
      key: node.id,
      name: node.displayName,
      color: this.colorByCategory(category, categories),
      bgColor: this.bgColorByCategory(category, categories),
      strokeWidth: node.id == selectedNodeId ? 3 : 1,
      conn: this.renderConnections(node),
      children: []
    };
  });
  graphNodes?.forEach(gn => {
    const parent = (gn.conn && graphNodes.find(p => p.key === gn.conn)) || graph;
    parent.children.push(gn);
  });
  return graph;
},

colorByCategory(category, categories) {
  return categories?.[category]?.color || 'crimson';
},

bgColorByCategory(category, categories) {
  return categories?.[category]?.bgColor || 'lightgrey';
},

renderConnections(node) {
  const connections = values(node.connections)?.[0];
  return connections?.[0]?.from;
},

onNodeRemove({eventlet: {key}, graph, selectedNodeId}) {
  delete graph.nodes[key];
  return {
    graph,
    selectedNodeId: key === selectedNodeId ? null : selectedNodeId
  };
},

updateConnectionCandidates(node, name, candidates) {
  return {
    ...node,
    connections: {
      ...node.connections,
      [name]: {
        ...node.connections[name],
        candidates
      }
    }
  };
},

onNodeSelect({eventlet: {key}}) {
  return {selectedNodeId: key};
},

onDrop({eventlet: {value}, graph, nodeTypes}) {
  if (graph) {
    const newNode = this.makeNewNode(value, graph, nodeTypes);
    graph.nodes[newNode.id] = this.makeNewNode(value, graph, nodeTypes);
    return {graph};
  }
},

makeNewNode(id, graph, nodeTypes) {
  const {displayName} = nodeTypes[id].$meta;
  const index = this.indexNewNode(id, graph.nodes);
  return {
    type: id,
    index,
    id: this.formatNodeId(id, index),
    displayName: this.displayName(displayName || id, index)
  };
},

indexNewNode(id, nodes) {
  const typedNodes = values(nodes).filter(node => id === node.type);
  return (typedNodes.pop()?.index || 0) + 1;
},

displayName(name, index) {
  const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1);
  return `${capitalize(name)}${index > 1 ? ` ${index}` : ''}`;
},

formatNodeId(id, index) {
  return `${id}${index}`.replace(/ /g,'');
},

onDeleteAll({graph}) {
  graph.nodes = {};
  return {
    graph,
    selectedNodeId: null
  };
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
<!-- <div toolbar>
  <span flex></span>
  <mwc-icon-button on-click="onDeleteAll" icon="delete_forever"></mwc-icon-button>
</div> -->
<drop-target flex grid scrolling on-target-drop="onDrop">
  <node-graph nodes="{{graphNodes}}" on-select="onNodeSelect" on-delete="onNodeRemove"></node-graph>
</drop-target>
`
});
