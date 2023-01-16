/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
/* global mapBy */
({
nameDelim: ':',

async update(input, state, tools) {
  // state.graph = await this.constructContainerGraph(input, state, tools);
  // work on selectedNodeId
  const selectCandidate = this.updateSelectedNodeId(input, state);
  // best not to output unless we did something
  // TODO(sjmiles): this is not ergonomic, perhaps dirty-checking output can
  // prevent update waterfall with small perf cost?
  if (selectCandidate != input.selectedNodeId) {
    return {selectedNodeId: selectCandidate};
  }
},

updateSelectedNodeId({graph, selectedNodeId}, state) {
  let candidate = selectedNodeId;
  // when switching graphs, we reset some state
  if (graph?.$meta?.name !== state.selectedGraphName) {
    state.selectedGraphName = graph?.$meta?.name;
    candidate = null;
  }
  return candidate;
},

render({graph, layoutId, selectedNodeId, nodeTypes, categories}) {
  const [nodes, layout] = [graph?.nodes, graph?.layout?.[layoutId]];
  const graphNodes = this.renderContainers(nodes, layout, selectedNodeId, nodeTypes, categories);
  return {graphNodes};
},

renderContainers(nodes, layout, selectedNodeId, nodeTypes, categories) {
  const rootContainer = this.makeContainerModel('designer', 'graph');
  const rootNodes = values(nodes).filter(({id}) => this.isRootContainer(layout?.[`${id}:Container`]));
  rootContainer.graphNodes = this.makeNodesModels(rootNodes, nodes, layout, selectedNodeId, nodeTypes, categories);
  return [rootContainer];
},

makeNodesModels(currentNodes, allNodes, layout, selectedNodeId, nodeTypes, categories) {
  return values(currentNodes).map(node => {
    if (node) {
      const nodeModel = this.makeNodeModel(node, nodeTypes, categories, selectedNodeId);
      nodeModel.graphNodes = this.containersForNode(node, nodeTypes[node.type]);
      nodeModel.graphNodes.forEach(container => {
        const innerNodes = [];
        entries(layout).forEach(([nodeId, containerId]) => {
          if (container.id === containerId) {
            innerNodes.push(allNodes?.[nodeId.split(':')[0]]);
          }
        });
        container.graphNodes = this.makeNodesModels(innerNodes, allNodes, layout, selectedNodeId, nodeTypes, categories);
      });
      return nodeModel;
    }
    return {};
  });
},

isRootContainer(container) {
  return !container || container.includes('#graph'); // === 'designer#graph';
},

makeNodeModel({id, displayName, type}, nodeTypes, categories, selectedNodeId) {
  const nodeType = nodeTypes[type];
  const category = categories?.[nodeType?.$meta?.category] || 0;
  return {
    id,
    displayName: displayName || id,
    icon: category.icon || 'settings',
    color: category.color || 'crimson',
    bgColor: category.bgColor || 'gray',
    selected: id == selectedNodeId,
    isContainer: 'false',
    graphNodes: []
  }
},

getHostId(node) {
  const hosts = node?.position?.preview;
  return hosts ? Object.keys(hosts).pop().split(':')?.[0] : null;
},

containersForNode(node, nodeType) {
  let containers = [];
  for (const hostName of this.getHostNames(nodeType)) {
    const slots = nodeType[hostName].$slots;
    if (keys(slots).length) {
      const allow = name => name.toLowerCase().includes('container');
      const allowed = keys(slots).filter(key => allow(key, slots[key]));
      containers = allowed.map(key => this.makeContainerModel(this.hostId(node, hostName), key));
    }
  }
  return containers;
},

getHostNames(nodeType) {
  const notKeyword = name => !name.startsWith('$');
  return keys(nodeType).filter(notKeyword);
},

makeContainerModel(hostId, slotName) {
  return {
    icon: 'folder',
    id: `${hostId}#${slotName}`,
    name: slotName,
    isContainer: 'true'
  };
},

async onNodeSelect({eventlet: {key}}) {
  return {selectedNodeId: key};
},

async onDrop({eventlet: {key: container, value: {id}}, graph, nodeTypes, layoutId}, state, {service}) {
  // function for later
  const setContainer = async (hostIds, container) => service({kind: 'ComposerService', msg: 'setContainer', data: {hostIds, container}});
  // node being dropped
  const node = graph.nodes[id];
  // collect info about this node
  const nodeType = nodeTypes[node.type];
  const hostNames = this.getHostNames(nodeType);
  const hostIds = hostNames.map(name => this.hostId(node, name));
  // map the container layout, create objects as needed
  const containerId = `${id}:Container`;
  ((graph.layout ??= {})[layoutId] ??= {})[containerId] = container;
  // punt root
  if (container === 'designer#graph') {
    delete graph.layout[layoutId][containerId];
  }
  // inform the render agent
  // TODO(sjmiles): deprecate in favor of changing layout data
  await setContainer(hostIds, container);
  // modified data
  return {
    selectedNodeId: id,
    graph
  };
},

hostId(node, hostName) {
  return `${node.id}${this.nameDelim}${hostName}`;
},

template: html`
<style>
  :host {
    display: block;
    color: var(--theme-color-fg-0);
    background-color: var(--theme-color-bg-0);
    --border-color: var(--theme-color-bg-2);
    white-space: nowrap;
  }
  [scrolling] {
    padding-right: 6px;
  }
  [node] {
    border-left: 1px solid transparent;
  }
  [particle] {
    font-size: 0.9rem;
    font-weight: bold;
    color: black;
    overflow: hidden;
    /* height: 30px; */
  }
  /* [selected][particle], [particle]:has([selected]) {
    height: auto;
  } */
  [selected][particle] {
    background-color: var(--theme-color-bg-3);
  }
  [selected] [particle] {
    border-left: 1px solid var(--border-color);
  }
  [container] {
    font-weight: normal;
    font-size: 0.75rem;
    color: inherit;
  }
  [selected] [container] {
    background-color: var(--theme-color-bg-4);
  }
  drop-target {
    padding: 4px;
    display: flex;
    align-items: center;
  }
  [selected] [bar] {
    border-left: 1px solid var(--border-color);
  }
  [name] {
    padding-left: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  [containers], [nodes] {
    background-color: var(--theme-color-bg-0);
    overflow: hidden;
    padding-left: 12px;
  }
  icon {
    font-size: 16px;
    width: 16px;
    height: 21px;
  }
  /* draggable-item {
    margin-bottom: 2px;
  } */
</style>

<div flex scrolling repeat="container_t">{{graphNodes}}</div>

<template node_t>
  <div particle node selected$="{{selected}}" key="{{id}}" on-click="onNodeSelect">
    <draggable-item row key="{{id}}" name="{{displayName}}"></draggable-item>
    <div containers repeat="container_t">{{graphNodes}}</div>
  </div>
</template>

<template container_t>
  <div container node selected$="{{selected}}" key="{{id}}" on-click="onNodeSelect">
    <drop-target key="{{id}}"on-target-drop="onDrop">
      <icon>{{icon}}</icon>
      <span flex name>{{name}}</span>
    </drop-target>
    <div nodes repeat="node_t">{{graphNodes}}</div>
  </div>
</template>
`
});
