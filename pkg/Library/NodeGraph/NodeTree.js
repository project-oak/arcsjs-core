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
  state.nodeTypesMap = {};
  values(nodeTypes).forEach(t => state.nodeTypesMap[t.$meta.name] = t);
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

render({pipeline, categories, selectedNode}, state) {
  const nodes = pipeline?.nodes;
  const key = selectedNode?.key;
  const graphNodes = this.renderGraphNodes(nodes, state.nodeTypesMap, key, categories);
  const containers = this.renderContainers(nodes, state.nodeTypesMap, key);
  if (!state.selectedContainer ||
      (containers?.length > 0 && containers?.find(c => c.key === state.selectedContainer))) {
    state.selectedContainer = containers?.[0]?.key;
  }
  return {containers, graphNodes};
},

renderGraphNodes(nodes, nodeTypesMap, nodeKey, categories) {
  const graph = {name: 'root', graphNodes: []};
  const graphNodes = nodes?.map(node => {
    const {key} = node;
    const name = node.name;
    const nodeType = nodeTypesMap[node.name];
    const categoryName = nodeType?.$meta?.category;
    const category = categories?.[categoryName];
    const containers = this.containersForNode(node, nodeTypesMap);
    return {
      key,
      name,
      icon: category.icon || 'settings',
      color: category.color || 'crimson',
      bgColor: category.bgColor || 'gray',
      selected: key == nodeKey,
      graphNodes: containers
    };
  });
  graphNodes?.forEach(gn => {
    const parent = graph;
    parent.graphNodes.push(gn);
  });
  return [graph];
},

containersForNode(node, nodeTypesMap) {
  // state of each host in the 'preview' layout (Runner)
  const hosts = node?.position?.preview;
  if (hosts) {
    // get first one only
    const hostName = keys(hosts)?.[0];
    // nodeType contains slot information
    // smush it together with hostName for container id
    return this.containersFromNodeType(hostName, node, nodeTypesMap);
  }
  return [];
},

containersFromNodeType(hostName, node, nodeTypesMap) {
  // results go here
  const containers = [];
  // TODO(sjmiles): use Parser (?!)
  // scan nodeType for slots
  entries(nodeTypesMap[node.type] ?? 0).forEach(([key, value]) => {
    // looking for Host identifiers
    if (key[0] !== '$') {
      // each slot is potentially a container
      const eachName = slotName => this.makeContainerModel(hostName, slotName);
      const models = keys(value?.$slots ?? 0).map(eachName);
      // remember any that we found
      containers.push(...models);
    }
  });
  // here go results
  return containers;
},

makeContainerModel(hostName, slotName) {
  return {
    icon: 'apps',
    key: `${hostName}#${slotName}`,
    name: `${hostName}:${slotName}`,
    isContainer: true
  };
},

renderContainers(nodes, nodeTypesMap, nodeKey) {
  // function mapping nodes to lists of containers
  const mapFn = node => this.containersForNode(node, nodeTypesMap);
  // nodes may have multiple containers, flatten the list, remove selected node
  // (it cannot be it's own container)
  return nodes?.map(mapFn).flat().filter(n => !n.key.startsWith(nodeKey));
},

async onNodeSelect({eventlet: {key}, pipeline}, state, {service}) {
  const selectedNode = pipeline.nodes.find(node => node.key === key);
  if (selectedNode) {
    //log(await service({kind: 'ComposerService', msg: 'getContainer', data: {node}}));
    return {selectedNode};
  }
},

onSelect({eventlet: {value: container}}, state) {
  state.selectedContainer = container;
},

async onSetContainer({selectedNode: node, pipeline}, {selectedContainer: container}, {service}) {
  if (container) {
    const hosts = node?.position?.preview;
    const hostId = hosts ? Object.keys(hosts).pop().split(':')?.[0] : '';
    await service({kind: 'ComposerService', msg: 'setContainer', data: {/*node*/hostId, container}});
    node = {
      ...node,
      position: {
        ...node.position,
        preview: {
          ...node.position.preview,
          [`${hostId}:Container`]: container
        }
      }
    };
    return {selectedNode: node, pipeline: this.updateNodeInPipeline(node, pipeline)};
  }
},

updateNodeInPipeline(node, pipeline) {
  const index = pipeline.nodes.findIndex(n => n.key === node.key);
  pipeline.nodes[index] = node;
  return pipeline;
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

// onNodeRemove({eventlet: {key}, pipeline, selectedNode}) {
//   pipeline.nodes = pipeline.nodes.filter(node => node.key !== key);
//   return {
//     pipeline,
//     selectedNode: key === selectedNode.key ? null : pipeline.nodes.find(n => n.key === selectedNode.key)
//   };
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
    font-size: 16px;
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
    padding: 8px;
  }
  [bar] {
    height: 28px;
  }
  [selected] {
    background-color: var(--theme-color-bg-1);
    border-radius: 4px;
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
      <icon>{{icon}}</icon>
      <draggable-item flex disabled="{{isContainer}}" key="{{key}}" name="{{name}}">
        &nbsp;<span>{{name}}</span>
      </draggable-item>
    </div>
    <div style="padding-left: 12px;" repeat="node_t">{{graphNodes}}</div>
  </div>
</template>

<!-- <drop-target flex grid scrolling on-drop="onDrop">
  <node-graph nodes="{{graphNodes}}" on-select="onNodeSelect" on-delete="onNodeRemove"></node-graph>
</drop-target> -->
`
});
