/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
async update({publicGraphs, graphs}, state) {
  if (publicGraphs && !state.publicGraphs) {
    state.publicGraphs = this.filterPublicGraphs(publicGraphs, graphs);
  }
},
filterPublicGraphs(publicGraphs, graphs) {
  if (Array.isArray(publicGraphs)) {
    return publicGraphs.filter(({$meta: {name, id}}) => !this.findGraphById(id, graphs));
  }
},
render({graph, graphs}, {publicGraphs}) {
  const separator = {name: '_________________', selected: false, isDisabled: true};
  return {
    graphs: [
      ...(this.renderGraphs(graphs, graph) || []),
      ...(publicGraphs?.length > 0 ? [separator] : []),
      ...(this.renderGraphs(publicGraphs, graph) || [])
    ]
  };
},
renderGraphs(graphs, selectedGraph) {
  return graphs ? graphs?.map?.(graph => {
    const {id} = graph.$meta;
    return {
      name: graph.$meta?.name,
      id,
      isDisabled: false,
      isSelected: id === selectedGraph?.$meta?.id
    };
  }) : [];
},
onSelect({eventlet: {value}, graphs}, {publicGraphs}) {
  const graph = this.findGraphById(value, graphs)
                || this.findGraphById(value, publicGraphs);
  log(`selected "${value}" (${graph?.$meta.name})`);
  return {graph};
},
findGraphById(id, graphs) {
  return graphs?.find?.(({$meta}) => $meta?.id === id);
},
findGraphByName(name, graphs) {
  return graphs?.find?.(({$meta}) => $meta?.name === name);
},
template: html`
<style>
  :host {
    border-radius: 8px;
  }
  select {
    font-family: 'Google Sans', sans-serif;
    font-size: 0.75rem;
    padding: 4px 6px;
    border-radius: 8px;
    width: 100%;
  }
</style>

<div bar>
  <span flex></span>
  <select title="Current Graph" repeat="graph_t" on-change="onSelect">{{graphs}}</select>
</div>

<template graph_t>
  <option selected="{{isSelected}}" value="{{id}}" disabled="{{isDisabled}}">{{name}}</option>
</template>
  `
});
