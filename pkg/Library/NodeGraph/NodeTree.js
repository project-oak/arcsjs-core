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
  // prevent update waterfall with small perf cost for automation.
  if (selectCandidate != input.selectedNodeId) {
    return {selectedNodeId: selectCandidate};
  }
},

// async constructContainerGraph({pipeline, nodeTypes}, {service}) {
//   let parsed, tree;
//   // a pipeline is a set of Nodes + metadata (name, id)
//   const nodes = pipeline?.nodes || [];
//   for (const node of nodes) {
//     // name, type, index, key, props, position: {preview: {host: {data}...}, other: {host: {data}...}}
//     const nodeType = nodeTypes[node.type];
//     parsed = await service({kind: 'RecipeService', msg: 'ParseRecipe', data: {recipe: nodeType}});
//     // TODO(sjmiles): boo, parser doesn't handle placeholder slots correctly
//     const slots = {root: []};
//     // every particle is assigned a slot
//     for (const p of parsed.particles) {
//       slots[p.container || 'root'] = [...(slots[p.container] || []), p];
//     }
//     //log(slots);
//     // reconstruct tree from flattened representation
//     const makeTree = (slots, here) => {
//       // always making a new tree
//       const treeNode = {
//         name: here,
//         chiles: []
//       };
//       // starting from this slot
//       const hosts = slots[here];
//       // these are the hosts in the slot
//       for (const h of hosts) {
//         // find slots that are owned by this host
//         const childSlots = keys(slots).filter(k => k.startsWith(h.id));
//         // build child trees off each slot
//         for (const key of childSlots) {
//           treeNode.chiles.push(makeTree(slots, key));
//         }
//       }
//       return treeNode;
//     };
//     tree = makeTree(slots, 'root');
//     //tree.chiles.length && log(tree);
//   }
//   return {parsed, tree};
// },

updateSelectedNodeId({pipeline, selectedNodeId}, state) {
  let candidate = selectedNodeId;
  // when switching pipelines, we reset some state
  const meta = pipeline?.$meta;
  if (meta?.name !== state.selectedPipelineName) {
    state.selectedPipelineName = meta?.name;
    candidate = null;
  }
  // select any first node by default
  // if (!selectedNode) {
  //   candidate = pipeline?.nodes?.[0];
  // }
  return candidate;
},

render({pipeline, categories, selectedNodeId, nodeTypes}) {
  const nodes = pipeline?.nodes;
  return {
    graphNodes: this.renderGraphNodes(nodes, nodeTypes, selectedNodeId, categories)
  };
},

renderGraphNodes(nodes, nodeTypes, nodeId, categories) {
  const rootContainer = this.makeContainerModel('main', 'runner');
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
  const containers = [];
  for (const particleName of this.getParticleNames(nodeType)) {
    const slots = nodeType[particleName].$slots;
    keys(slots).forEach(slotName => containers.push(
      this.makeContainerModel(this.hostId(node, particleName), slotName)
    ));
  }
  return containers;
},

getParticleNames(nodeType) {
  const notKeyword = name => !name.startsWith('$');
  return keys(nodeType).filter(notKeyword);
},

makeContainerModel(hostId, slotName) {
  return {
    icon: 'apps',
    key: `${hostId}#${slotName}`,
    name: slotName,
    isContainer: 'true'
  };
},

// renderContainers(nodes, nodeTypesMap, nodeId) {
//   // function mapping nodes to lists of containers
//   const mapFn = node => this.containersForNode(node, nodeTypesMap);
//   // nodes may have multiple containers, flatten the list, remove selected node
//   // (it cannot be it's own container)
//   return nodes?.map(mapFn).flat().filter(n => !n.id.startsWith(nodeId));
// },

async onNodeSelect({eventlet: {key}}) {
  return {selectedNodeId: key};
},

async onDrop({eventlet: {key: container, value: id}, pipeline, nodeTypes, layout}, state, {service}) {
  //log('onDrop:', key, container);
  const node = pipeline.nodes[id];
  const nodeType = nodeTypes[node.type];
  const hostIds = this.getParticleNames(nodeType).map(particleName => this.hostId(node, particleName));
  await service({kind: 'ComposerService', msg: 'setContainer', data: {hostIds, container}});
  return {
    selectedNodeId: id,
    layout: {...layout, [`${id}:Container`]: container}
  };
},

hostId(node, particleName) {
  return `${node.id}${this.nameDelim}${particleName}`;
},


template: html`
<style>
  :host {
    display: block;
    /* font-size: 16px; */
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
      <!-- -->
      <icon>{{icon}}</icon>
      <!-- -->
      <draggable-item flex row hide$="{{isContainer}}" key="{{id}}" name="{{displayName}}">
        <span flex name>{{name}}</span>
      </draggable-item>
      <!-- -->
      <drop-target clip row key="{{id}}" show$="{{isContainer}}" on-target-drop="onDrop">
        <span flex name>{{name}}</span>
      </drop-target>
      <!-- -->
    </div>

    <div containers repeat="node_t">{{graphNodes}}</div>

  </div>
</template>
`
});
