/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async update({graph}, state, {service}) {
  if (state.graph && graph?.$meta?.id !== state.graph?.$meta?.id) {
    await service({kind: 'ArcService', msg: 'removeGraph', data: {graph: state.graph}});
  }
  if (graph && !deepEqual(graph, state.graph)) {
    // state.particleIds = 
    await service({kind: 'ArcService', msg: 'runGraph', data: {graph}});
  }
  state.graph = graph;
},

render({graph, nodeTypes, categories, layoutId}, {selectedNodeId}) {
  const node = graph?.nodes?.[selectedNodeId];
  const nodeType = nodeTypes?.[node?.type];
  const ids = this.particleIdsForNode(node, graph, nodeTypes);
  const rects = this.getRects(graph, nodeTypes,layoutId);
  return {
    rects,
    selectedKeys: ids,
    color: this.colorByCategory(nodeType?.$meta?.category, categories),
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
  // return {
  //   graph,
  //   ...this.selectNode(null, state)
  // };
},

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
    min-height: 120px;
  }
  designer-layout {
    height: auto !important;
  }
  [frame="graph"] {
    border: 2px dashed #850d67;
  }
</style>
<div bar frame="chooser"></div>
<drop-target flex row on-target-drop="onDrop">
  <!-- <div flex column frame="graph"></div> -->
  <designer-layout flex Xscrolling column frame="graph"
                    statical
                    on-position="onNodePosition"
                    on-delete="onNodeDelete"
                    selected="{{selectedKeys}}"
                    rects="{{rects}}"
                    color="{{color}}"
                    Xhidebox="{{hideBox}}"
                    >
  </designer-layout>
</drop-target>
`
});
