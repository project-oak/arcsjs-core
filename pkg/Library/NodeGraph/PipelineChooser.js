/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
async update({publicPipelines, pipelines}, state) {
  if (publicPipelines && !state.publicPipelines) {
    state.publicPipelines = this.filterPublicPipelines(publicPipelines, pipelines);
  }
},
filterPublicPipelines(publicPipelines, pipelines) {
  if (Array.isArray(publicPipelines)) {
    return publicPipelines.filter(({$meta: {name, id}}) => !this.findPipelineById(id, pipelines));
  }
},
render({graph, pipelines}, {publicPipelines}) {
  const separator = {name: '_________________', selected: false, isDisabled: true};
  return {
    pipelines: [
      ...(this.renderPipelines(pipelines, graph) || []),
      ...(publicPipelines?.length > 0 ? [separator] : []),
      ...(this.renderPipelines(publicPipelines, graph) || [])
    ]
  };
},
renderPipelines(pipelines, selectedPipeline) {
  return pipelines ? pipelines?.map?.(graph => {
    const {id} = graph.$meta;
    return {
      name: graph.$meta?.name,
      id,
      isDisabled: false,
      isSelected: id === selectedPipeline?.$meta?.id
    };
  }) : [];
},
onSelect({eventlet: {value}, pipelines}, {publicPipelines}) {
  const graph = this.findPipelineById(value, pipelines)
                || this.findPipelineById(value, publicPipelines);
  log(`selected "${value}" (${graph?.$meta.name})`);
  return {graph};
},
findPipelineById(id, pipelines) {
  return pipelines?.find?.(({$meta}) => $meta?.id === id);
},
findPipelineByName(name, pipelines) {
  return pipelines?.find?.(({$meta}) => $meta?.name === name);
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
  <select title="Current Pipeline" repeat="pipeline_t" on-change="onSelect">{{pipelines}}</select>
</div>

<template pipeline_t>
  <option selected="{{isSelected}}" value="{{id}}" disabled="{{isDisabled}}">{{name}}</option>
</template>
  `
});
