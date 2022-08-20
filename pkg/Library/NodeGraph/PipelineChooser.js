/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
async update(inputs, state) {
  if (!state.publicPipelines) {
    try {
      state.publicPipelines = await this.fetchPublicPipelines(inputs);
    } catch (e) {
      log(`Failed fetching public pipelines from ${inputs.publicPipelinesUrl} (${e.toString()})`);
    }
  }
},
async fetchPublicPipelines({publicPipelinesUrl, pipelines}) {
  if (publicPipelinesUrl) {
    const res = await fetch(publicPipelinesUrl);
    if (res.status === 200) {
      const text = await res.text();
      if (text) {
        const publicPipelines = values(JSON.parse(text.replace(/"\*/g, '"$')) ?? Object);
        if (Array.isArray(publicPipelines)) {
          return publicPipelines.filter(({$meta: {name}}) => !this.findPipelineByName(name, pipelines));
        }
      }
    }
  }
},
render({pipeline, pipelines}, {publicPipelines}) {
  const separator = {name: '_________________', selected: false, isDisabled: true};
  return {
    pipelines: [
      ...(this.renderPipelines(pipelines, pipeline?.$meta?.name) || []),
      ...(publicPipelines?.length > 0 ? [separator] : []),
      ...(this.renderPipelines(publicPipelines, pipeline?.$meta?.name) || [])
    ]
  };
},
renderPipelines(pipelines, selectedName) {
  return !pipelines ? [] : pipelines?.map?.(({$meta}) => ({
    name: $meta?.name,
    isDisabled: false,
    isSelected: $meta?.name === selectedName
  }));
},
onSelect({eventlet: {value}, pipelines}, {publicPipelines}) {
  log(`selected "${value}"`);
  return {
    pipeline: this.findPipelineByName(value, pipelines) || this.findPipelineByName(value, publicPipelines)
  };
},
findPipelineByName(name, pipelines) {
  return pipelines?.find?.(({$meta}) => $meta?.name === name);
},
onRefresh(inputs, state) {
  state.publicPipelines = null;
},
template: html`
<style>
  select {
    font-family: 'Google Sans', sans-serif;
    font-size: 0.8rem;
    padding: 3px 6px;
    border-radius: 6px;
    width: 100%;
  }
</style>

<div bar>
  <span flex></span>
  <select title="Current Pipeline" repeat="pipeline_t" on-change="onSelect">{{pipelines}}</select>
  <mwc-icon-button title="Refresh Pipeline List" icon="refresh" on-click="onRefresh"></mwc-icon-button>
</div>

<template pipeline_t>
  <option selected="{{isSelected}}" disabled="{{isDisabled}}">{{name}}</option>
</template>
  `
});
