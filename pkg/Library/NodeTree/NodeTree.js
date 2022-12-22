/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
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

render({graph, categories, selectedNodeId, nodeTypes}) {
  const nodes = graph?.nodes;
  return {
    graphNodes: this.renderGraphNodes(nodes, nodeTypes, selectedNodeId, categories)
  };
},

renderGraphNodes(nodes, nodeTypes, nodeId, categories) {
  const rootContainer = this.makeContainerModel('main', 'graph');
  const graph = {name: 'Root', icon: 'settings', graphNodes: [rootContainer], isContainer: 'true'};
  const graphNodes = values(nodes).map(node => {
    const {id, displayName, type} = node;
    const nodeType = nodeTypes[type];
    const categoryName = nodeType?.$meta?.category;
    const category = categories?.[categoryName] || 0;
    const containers = this.containersForNode(node, nodeType);
    return {
      id,
      displayName,
      icon: category.icon || 'settings',
      color: category.color || 'crimson',
      bgColor: category.bgColor || 'gray',
      selected: id == nodeId,
      isContainer: 'false',
      graphNodes: containers
    };
  });
  graphNodes?.forEach(gn => {
    const parent = graph;
    parent.graphNodes.push(gn);
  });
  return [graph];
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
  // crunch the numbers
  const node = graph.nodes[id];
  const nodeType = nodeTypes[node.type];
  const hostNames = this.getHostNames(nodeType);
  const hostIds = hostNames.map(name => this.hostId(node, name));
  // inform the render agent
  const setContainer = async (hostIds, container) => service({kind: 'ComposerService', msg: 'setContainer', data: {hostIds, container}});
  await setContainer(hostIds, container);
  // map the container layout, create objects as needed
  ((graph.layout ??= {})[layoutId] ??= {})[`${id}:Container`] = container;
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
