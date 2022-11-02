/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
async update({publicPipelines, graphs}, state) {
  if (publicPipelines && !state.publicPipelines) {
    state.publicPipelines = this.filterPublicPipelines(publicPipelines, graphs);
  }
},
filterPublicPipelines(publicPipelines, graphs) {
  if (Array.isArray(publicPipelines)) {
    return publicPipelines.filter(({$meta: {name, id}}) => !this.findPipelineById(id, graphs));
  }
},
render({graph, graphs}, {publicPipelines}) {
  const separator = {name: '_________________', selected: false, isDisabled: true};
  return {
    graphs: [
      ...(this.renderPipelines(graphs, graph) || []),
      ...(publicPipelines?.length > 0 ? [separator] : []),
      ...(this.renderPipelines(publicPipelines, graph) || [])
    ]
  };
},
renderPipelines(graphs, selectedGraph) {
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
onSelect({eventlet: {value}, graphs}, {publicPipelines}) {
  const graph = this.findPipelineById(value, graphs)
                || this.findPipelineById(value, publicPipelines);
  log(`selected "${value}" (${graph?.$meta.name})`);
  return {graph};
},
findPipelineById(id, graphs) {
  return graphs?.find?.(({$meta}) => $meta?.id === id);
},
findPipelineByName(name, graphs) {
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
  <select title="Current Pipeline" repeat="pipeline_t" on-change="onSelect">{{graphs}}</select>
</div>

<template pipeline_t>
  <option selected="{{isSelected}}" value="{{id}}" disabled="{{isDisabled}}">{{name}}</option>
</template>
  `
});
