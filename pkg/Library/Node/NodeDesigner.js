/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async update({graph}, state, {service}) {
  const arcService = (msg, graph) => service({kind: 'ArcService', msg, data:{graph}});
  // if the old graph is not the input graph, remove it
  if (state.graph && graph?.$meta?.id !== state.graph?.$meta?.id) {
    await arcService('removeGraph', state.graph);
  }
  // if the input graph is not the old graph, run it
  if (graph && !deepEqual(graph, state.graph)) {
    await arcService('runGraph', graph);
  }
  // remember the old graph
  state.graph = graph;
},

render({graph, nodeTypes, categories, layoutId, selectedNodeId}) {
  // selected node
  const node = graph?.nodes?.[selectedNodeId];
  // make selection into array
  const selectedKeys = selectedNodeId ? [selectedNodeId] : null;
  // collate rectangles
  const rects = this.getRects(graph, nodeTypes, layoutId);
  // conjure color info
  const nodeType = nodeTypes?.[node?.type];
  const color = this.colorByCategory(nodeType?.$meta?.category, categories);
  // send to template
  return {
    rects,
    selectedKeys,
    color
  };
},

particleIdsForNode(node, graph, nodeTypes) {
  return node
    && !this.isUIHidden(node)
    && this.getParticleNamesForNode(node, graph, nodeTypes)
    || []
    ;
},

getParticleNamesForNode(node, graph, nodeTypes) {
  if (graph) {
    const nodeType = nodeTypes[node.type];
    return keys(nodeType)
      .filter(key => !key.startsWith('$'))
      .map(key => `${node.id}:${key}`);
  }
},

getRects(graph, nodeTypes, layoutId) {
  const rectMap = (id, node) => ({id, position: graph.layout?.[layoutId]?.[node.id]});
  const nodeMap = node => this.particleIdsForNode(node, graph, nodeTypes).map(id => rectMap(id, node));
  return values(graph?.nodes).map(nodeMap).flat();
},

isUIHidden(node) {
  return Boolean(node?.props?.hideUI);
},

onNodeDelete({eventlet: {key}, graph}, state) {
  // TODO(mariakleiner): update to not use RECIPES
  // const node = this.findNodeByParticle(key, graph, state.recipes);
  // delete graph.nodes[node.id];
  // this.deleteNodeFromLayout(graph.layout, node.id);
  // return {
  //   graph,
  //   ...this.selectNode(null, state)
  // };
},

// deleteNodeFromLayout(layouts, nodeId) {
//   keys(layouts).forEach(layoutId => {
//     const layout = layouts[layoutId];
//     delete layout[nodeId];
//     delete layout[`${nodeId}:Container`];
//     keys(layout).forEach(id => {
//       if ((typeof layout[id] === 'string') && layout[id]?.startsWith(nodeId)) {
//         delete layout[id];
//       }
//     });
//   });
// },

onNodePosition({eventlet: {key, value}, graph, layoutId}, state) {
  // TODO(mariakleiner): update to not use RECIPES
  // const node = this.findNodeByParticle(key, graph, state.recipes);
  // if (!node) {
  //   return this.selectNode(null, state);
  // }
  // ((graph.layout ??= {})[layoutId] ??= {})[node.id] = value;
  // //console.log('caching layout rect', node.id, value);
  // return {
  //   graph,
  //   ...this.selectNode(node.id, state)
  // };
},

onSelect({eventlet: {value}}, state) {
  return this.selectNode(value, state);
},

selectNode(id, state) {
  state.selectedNodeId = id;
  return {
    selectedNodeId: id
  };
},

findNodeByParticle(particleName, graph, recipes) {
  return values(graph.nodes).find(node => {
    const names = this.getParticleNamesForNode(node, graph, recipes);
    return names?.find(name => name === particleName);
  });
},

encodeFullNodeId({id}, {$meta}) {
  return [$meta?.id, id].filter(Boolean).join(this.idDelimiter);
},

colorByCategory(category, categories) {
  return categories?.[category]?.color || 'lightblue';
},

onDrop({eventlet: {value: {id: type, position}}, graph, newNodeInfos, layoutId}) {
  if (graph) {
    return {
      newNodeInfos: [...(newNodeInfos || []), {
        type,
        [layoutId]: position
      }]
    };
  }
},

template: html`
<style>
  :host {
    color: var(--theme-color-fg-1);
    background-color: var(--theme-color-bg-1);
  }
  designer-layout {
    height: auto !important;
    /* border: 2px dashed #850d67; */
  }
</style>

<div bar><slot name="chooser"></slot></div>

<drop-target flex row on-target-drop="onDrop">
  <selector-panel flex column
      selected="{{selectedKeys}}"
      color="{{color}}"
      on-select="onSelect"
  >
    <slot name="graph"></slot>
  </selector-panel>
  <!-- <designer-layout flex column
    statical
    selected="{{selectedKeys}}"
    rects="{{rects}}"
    color="{{color}}"
    on-position="onNodePosition"
    on-delete="onNodeDelete"
  >
    <slot name="graph"></slot>
  </designer-layout>
  -->
</drop-target>
`
});
