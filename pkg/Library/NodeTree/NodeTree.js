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

render({graph, categories, selectedNodeId, nodeTypes, layoutId}) {
  const graphNodes = this.renderContainers(graph?.nodes, graph?.layout?.[layoutId], selectedNodeId, nodeTypes, categories);
  return {graphNodes};
},

renderContainers(nodes, layout, selectedNodeId, nodeTypes, categories) {
  const rootContainer = this.makeContainerModel('designer', 'root');
  const rootNodes = values(nodes).filter(({id}) => this.isRootContainer(layout?.[`${id}:Container`]));
  rootContainer.graphNodes = this.makeNodesModels(rootNodes, nodes, layout, selectedNodeId, nodeTypes, categories);
  return [rootContainer];
},

makeNodesModels(currentNodes, allNodes, layout, selectedNodeId, nodeTypes, categories) {
  return values(currentNodes).map(node => {
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
  });
},

isRootContainer(container) {
  return !container  || (container === 'main#graph');
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
      //log('--- containersForNode');
      //entries(slots).forEach(([name, slot]) => log(name, ': ', Boolean(slot.$isContainer)));
      //const allow = (name, slot) => slot.$isContainer;
      const allow = (name, slot) => name.toLowerCase().includes('container');
      //log(keys(slots));
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
    icon: 'apps',
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
  ((graph.layout ??= {})[layoutId] ??= {})[`${id}:Container`] = container;
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
    --edge-border: 1px solid #555;
    --mdc-icon-size: 18px;
    --mdc-icon-button-size: 26px;
  }
  mwc-icon-button {
    color: var(--theme-color-fg-1);
  }
  [node] {
    cursor: pointer;
    margin: 8px;
    font-size: 0.9em;
    border: 1px solid grey;
    padding: 4px;
  }
  [bar] {
    height: 28px;
  }
  [selected] {
    background-color: var(--theme-color-bg-2);
    border-radius: 4px;
  }
  [name] {
    padding-left: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  [containers] {
    background-color: var(--theme-color-bg-0);
    overflow: hidden;
  }
</style>

<div flex scrolling repeat="node_t">{{graphNodes}}</div>

<template node_t>
  <div node selected$="{{selected}}" key="{{id}}" on-click="onNodeSelect">
    <div bar>
      <icon>{{icon}}</icon>
      <draggable-item flex row hide$="{{isContainer}}" key="{{id}}" name="{{displayName}}"> </draggable-item>
      <drop-target clip row key="{{id}}" show$="{{isContainer}}" on-target-drop="onDrop">
        <span flex name>{{name}}</span>
      </drop-target>
    </div>
    <div containers repeat="node_t">{{graphNodes}}</div>
  </div>
</template>
`
});
