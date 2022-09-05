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

safeKeys(o) {
  return o ? Object.keys(o) : [];
},

update({pipeline, selectedNode, nodeTypes}, state) {
  // build a map of nodeTypes
  state.nodeTypes = {};
  values(nodeTypes).forEach(t => state.nodeTypes[t.$meta.name] = t);
  // when switching pipelines, we reset some state
  if (pipeline?.$meta?.name !== state.selectedPipelineName) {
    state.selectedPipelineName = pipeline?.$meta.name;
    selectedNode = null;
  }
  // maybe find a new selected node
  const node = this.updateSelectedNode({pipeline, selectedNode}, state);
  if (node !== selectedNode) {
    return {selectedNode: node};
  }
},

updateSelectedNode({pipeline, selectedNode}, state) {
  if (!selectedNode && pipeline?.nodes?.length) {
    selectedNode = pipeline.nodes[0];
  }
  return selectedNode;
},

render({pipeline, categories, selectedNode}, {nodeTypes}) {
  const nodes = pipeline?.nodes;
  return {
    containers: this.renderContainerOptions(nodes, nodeTypes),
    graphNodes: this.renderGraphNodes(nodes, selectedNode, nodeTypes, categories)
  };
},

renderContainerOptions(nodes, nodeTypes) {
  let containers = [];
  nodes?.forEach(node => {
    containers.push(...this.containersForNode(node, nodeTypes));
  });
  return containers;
},

containersForNode(node, nodeTypes) {
  const nodes = node?.position?.preview;
  if (nodes) {
    const hostName = keys(nodes)?.[0];
    const nodeType = nodeTypes[node.type];
    return this.containersForNodeType(hostName, nodeType);
  }
  return [];
},

containersForNodeType(hostName, nodeType) {
  const containers = [];
  entries(nodeType).forEach(([key, value]) => {
    if (key[0] !== '$') {
      const $slots = value?.$slots;
      if ($slots) {
        keys($slots).forEach(slotName => {
          containers.push({icon: 'apps', key: `${hostName}#${slotName}`, name: `${hostName}:${slotName}`});
        });
      }
    }
  });
  return containers;
},

renderGraphNodes(nodes, selectedNode, nodeTypes, categories) {
  const graph = {name: 'root', graphNodes: []};
  const graphNodes = nodes?.map(node => {
    const {key} = node;
    const name = this.nodeDisplay(node);
    const nodeType = nodeTypes[node.name];
    const category = nodeType?.$meta?.category;
    const containers = this.containersForNode(node, nodeTypes);
    return {
      key,
      name,
      icon: 'settings',
      //displayName: key ? `${key} [${name}]` : name,
      color: this.colorByCategory(category, categories),
      bgColor: this.bgColorByCategory(category, categories),
      selected: key == selectedNode?.key,
      //conn: this.renderConnections(node),
      graphNodes: containers
    };
  });
  graphNodes?.forEach(gn => {
    const parent = /*(gn.conn && graphNodes.find(p => p.key === gn.conn)) ||*/ graph;
    parent.graphNodes.push(gn);
  });
  return [graph];
},

findParent(node, graphNodes) {
  // n
  // graphNodes.find
  // (gn.conn && graphNodes.find(p => p.key === gn.conn)) || graph
},

renderConnections(node, pipeline) {
  return this.safeKeys(node.connections || {})
    .map(storeName => this.renderStoreConnections(storeName, node, pipeline))
    .flat();
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

onNodeRemove({eventlet: {key}, pipeline, selectedNode}) {
  pipeline.nodes = pipeline.nodes.filter(node => node.key !== key);
  return {
    pipeline,
    selectedNode: key === selectedNode.key ? null : pipeline.nodes.find(n => n.key === selectedNode.key)
  };
},

async onNodeSelect({eventlet: {key}, pipeline}, state, {service}) {
  const node = pipeline.nodes.find(node => node.key === key);
  if (node) {
    log(await service({kind: 'ComposerService', msg: 'getContainer', data: {node}}));
    return {
      selectedNode: node
    };
  }
},

onSelect({eventlet: {value: container}}, state) {
  state.selectedContainer = container;
},

async onSetContainer({selectedNode: node}, {selectedContainer: container}, {service}) {
  if (container) {
    await service({kind: 'ComposerService', msg: 'setContainer', data: {node, container}});
  }
},

// onDrop({eventlet: {value}, pipeline, nodeTypes}) {
//   if (pipeline) {
//     const type = value.split(this.catalogDelimiter)[1];
//     const nodeType = nodeTypes[type];
//     const newNode = this.makeNewNode(nodeType, pipeline.nodes);
//     pipeline.nodes = [...pipeline.nodes, newNode];
//     return {pipeline};
//   }
// },

// makeNewNode({$meta: {name}}, nodes) {
//   const typedNodes = nodes.filter(node => name === node.name);
//   const index = (typedNodes.length ? typedNodes[typedNodes.length - 1].index : 0) + 1;
//   return {
//     name,
//     index,
//     key: this.formatNodeKey({name, index}),
//   };
// },

// formatNodeKey({name, index}) {
//   return `${name}${index}`.replace(/ /g,'');
// },

// onDeleteAll({pipeline}) {
//   pipeline.nodes = [];
//   return {
//     pipeline,
//     selectedNode: null
//   };
// },

template: html`
<style>
  :host {
    display: block;
    /* height: 100%; */
    font-size: 16px;
    color: var(--theme-color-fg-1);
    background-color: var(--theme-color-bg-1);
    --edge-border: 1px solid #555;
    --mdc-icon-size: 18px;
    --mdc-icon-button-size: 26px;
  }
  mwc-icon-button {
    color: var(--theme-color-fg-1);
  }
  [node] {
    cursor: pointer;
    padding: 8px;
  }
  [bar] {
    height: 28px;
  }
  [selected] {
    background-color: var(--theme-color-bg-2);
  }
  multi-select {
    /* padding: 4px; */
  }
</style>

<!-- <div toolbar>
  <span flex></span>
  <mwc-icon-button on-click="onDeleteAll" icon="delete_forever"></mwc-icon-button>
</div> -->

<div toolbar>
  <multi-select flex options="{{containers}}" on-change="onSelect"></multi-select>
  <mwc-icon-button on-click="onSetContainer" icon="tune"></mwc-icon-button>
</div>

<div repeat="node_t">{{graphNodes}}</div>

<template node_t>
  <div node selected$="{{selected}}" key="{{key}}" on-click="onNodeSelect">
    <div bar>
      <icon>{{icon}}</icon>&nbsp;<span>{{name}}</span>
    </div>
    <div style="padding-left: 12px;" repeat="node_t">{{graphNodes}}</div>
  </div>
</template>

<!-- <drop-target flex grid scrolling on-drop="onDrop">
  <node-graph nodes="{{graphNodes}}" on-select="onNodeSelect" on-delete="onNodeRemove"></node-graph>
</drop-target> -->
`
});
