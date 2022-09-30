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
async update(input, state, tools) {
  // build a map of nodeTypes
  state.nodeTypesMap = mapBy(input.nodeTypes, t => t.$meta.name);
  // ...
  state.graph = await this.constructContainerGraph(input, state, tools);
  // work on selectedNodeKey
  const selectCandidate = this.updateSelectedNodeKey(input, state);
  // best not to output unless we did something
  // TODO(sjmiles): this is not ergonomic, perhaps dirty-checking output can
  // prevent update waterfall with small perf cost for automation.
  if (selectCandidate != input.selectedNodeKey) {
    return {selectedNodeKey: selectCandidate};
  }
},

async constructContainerGraph({pipeline}, {nodeTypesMap}, {service}) {
  let parsed, tree;
  // a pipeline is a set of Nodes + metadata (name, id)
  const nodes = pipeline?.nodes || [];
  for (const node of nodes) {
    // name, type, index, key, props, position: {preview: {host: {data}...}, other: {host: {data}...}}
    const nodeType = nodeTypesMap[node.type];
    parsed = await service({kind: 'RecipeService', msg: 'ParseRecipe', data: {recipe: nodeType}});
    // TODO(sjmiles): boo, parser doesn't handle placeholder slots correctly
    const slots = {root: []};
    // every particle is assigned a slot
    for (const p of parsed.particles) {
      slots[p.container || 'root'] = [...(slots[p.container] || []), p];
    }
    //log(slots);
    // reconstruct tree from flattened representation
    const makeTree = (slots, here) => {
      // always making a new tree
      const treeNode = {
        name: here,
        chiles: []
      };
      // starting from this slot
      const hosts = slots[here];
      // these are the hosts in the slot
      for (const h of hosts) {
        // find slots that are owned by this host
        const childSlots = keys(slots).filter(k => k.startsWith(h.id));
        // build child trees off each slot
        for (const key of childSlots) {
          treeNode.chiles.push(makeTree(slots, key));
        }
      }
      return treeNode;
    };
    tree = makeTree(slots, 'root');
    //tree.chiles.length && log(tree);
  }
  return {parsed, tree};
},

updateSelectedNodeKey({pipeline, selectedNodeKey}, state) {
  let candidate = selectedNodeKey;
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

render({pipeline, categories, selectedNodeKey}, {nodeTypesMap}) {
  const nodes = pipeline?.nodes;
  return {
    graphNodes: this.renderGraphNodes(nodes, nodeTypesMap, selectedNodeKey, categories)
  };
},

renderGraphNodes(nodes, nodeTypesMap, nodeKey, categories) {
  const rootContainer = this.makeContainerModel('main', 'runner');
  const graph = {name: 'Root', icon: 'settings', graphNodes: [rootContainer], isContainer: 'true'};
  const graphNodes = nodes?.map(node => {
    const {key} = node;
    const name = node.name;
    const nodeType = nodeTypesMap[node.name];
    const categoryName = nodeType?.$meta?.category;
    const category = categories?.[categoryName] || 0;
    const containers = this.containersForNode(node, nodeTypesMap);
    return {
      key,
      name,
      icon: category.icon || 'settings',
      color: category.color || 'crimson',
      bgColor: category.bgColor || 'gray',
      selected: key == nodeKey,
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
    isContainer: "true"
  };
},

renderContainers(nodes, nodeTypesMap, nodeKey) {
  // function mapping nodes to lists of containers
  const mapFn = node => this.containersForNode(node, nodeTypesMap);
  // nodes may have multiple containers, flatten the list, remove selected node
  // (it cannot be it's own container)
  return nodes?.map(mapFn).flat().filter(n => !n.key.startsWith(nodeKey));
},

async onNodeSelect({eventlet: {key}}) { //, pipeline}, state, {service}) {
  // const selectedNode = pipeline.nodes.find(node => node.key === key);
  // if (selectedNode) {
    return {selectedNodeKey: key};
  // }
},

async onDrop({eventlet: {key: container, value: key}, pipeline/*, selectedNodeKey*/}, state, {service}) {
  //log('onDrop:', key, container);
  //
  // const node = pipeline.nodes.find(node => node.key === key);
  // const hosts = node?.position?.preview;
  // const hostKeys = keys(hosts).map(h => h.split(':')?.[0]);
  // log(hostKeys);
  //
  const node = pipeline.nodes.find(node => node.key === key);
  const hostId = this.getHostId(node);
  await service({kind: 'ComposerService', msg: 'setContainer', data: {hostId, container}});
  this.updateContainerInNode(node, hostId, container);
  return {selectedNodeKey: key};
},

updateContainerInNode(node, hostId, container) {
  // TODO (b/245770204): avoid copying objects
  // node.position = node.position || {};
  // node.position.preview = node.position.preview || {};
  // node.position.preview[`${hostId}:Container`] = container;
  // return node;
  //
  // TODO(sjmiles): avoid cloning objects _without rationale_,
  // In this case, we may have to construct intermediate objects,
  // which provides rationale.
  // There is no reason to clone `node` itself.
  //
  // The original syntax was elegant, just slightly amiss, and
  // I didn't recognize the 'may be null' bits at first.
  //
  node.position = {
    // may be null
    ...node.position,
    preview: {
      // may be null
      ...node.position?.preview,
      [`${hostId}:Container`]: container
    }
  };
  return node;
  //
  // return {
  //   ...node,
  //   position: {
  //     ...node.position,
  //     preview: {
  //       ...node.position.preview,
  //       [`${hostId}:Container`]: container
  //     }
  //   }
  // };
},

// updateNodeInPipeline(node, pipeline) {
//   const index = pipeline.nodes.findIndex(n => n.key === node.key);
//   // TODO (b/245770204): avoid copying objects
//   // pipeline.nodes[index] = node;
//   pipeline.nodes = assign([], pipeline.nodes, {[index]: node});
//   return pipeline;
// },

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
  <div node selected$="{{selected}}" key="{{key}}" on-click="onNodeSelect">

    <div bar>
      <!-- -->
      <icon>{{icon}}</icon>
      <!-- -->
      <draggable-item flex row hide$="{{isContainer}}" key="{{key}}" name="{{name}}">
        <span flex name>{{name}}</span>
      </draggable-item>
      <!-- -->
      <drop-target clip row key="{{key}}" show$="{{isContainer}}" on-target-drop="onDrop">
        <span flex name>{{name}}</span>
      </drop-target>
      <!-- -->
    </div>

    <div containers repeat="node_t">{{graphNodes}}</div>

  </div>
</template>
`
});
