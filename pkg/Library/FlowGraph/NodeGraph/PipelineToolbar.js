/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
  async update({pipeline, pipelines, publishPaths}, state, {service}) {
    let updatedPipelines;
    if (pipeline) {
      updatedPipelines = this.updateItemInPipelines(pipeline, pipelines);
    } else {
      pipeline = await this.makeNewPipeline(null, service);
      updatedPipelines = [...pipelines, pipeline];
      state.renaming = false;
    }
    if (publishPaths?.length > 0 && !state.selectedPublishKey) {
      state.selectedPublishKey = keys(publishPaths)[0];
    }
    return {
      pipeline,
      pipelines: updatedPipelines
    };
  },
  updateItemInPipelines(pipeline, pipelines) {
    const index = this.findPipelineIndex(pipeline, pipelines);
    if (index >= 0) {
      pipelines[index] = pipeline;
    }
    return pipelines;
  },
  async makeNewPipeline(name, service) {
    name = name ?? await service({msg: 'MakeName'});
    return {$meta: {name}, nodes: []};
  },
  render({pipeline, pipelines, publishPaths}, {renaming, selectedPublishKey}) {
    const isOwned = this.findPipelineByName(pipeline?.$meta?.name, pipelines) >= 0;
    const publishKeys = keys(publishPaths || {}).map(key => ({key, selected: key === selectedPublishKey}));
    return {
      showRenameIcon: String(!renaming && isOwned),
      showRenameInput: String(Boolean(renaming) && isOwned),
      showChooser: String(!renaming),
      showDeleteIcon: String(isOwned),
      publishKeys,
      showPublish: String(isOwned && publishKeys.length > 0),
      showUnpublish: String(Boolean(pipeline?.$meta.isPublished) && isOwned),
      name: pipeline?.$meta?.name
    };
  },
  async onNew({pipelines}, state, {service}) {
    const pipeline = await this.makeNewPipeline(null, service);
    return {
      pipeline,
      pipelines: [...pipelines, pipeline]
    };
  },
  async onCloneClicked({pipeline, pipelines}) {
    const clonedPipeline = await this.makeNewPipeline(`Copy of ${pipeline.$meta.name}`);
    clonedPipeline.nodes = [...pipeline.nodes];
    return {
      pipeline: clonedPipeline,
      pipelines: [...pipelines, clonedPipeline]
    };
  },
  async onDelete({pipeline, pipelines, publishPaths}) {
    const index = this.findPipelineIndex(pipeline, pipelines);
    pipelines.splice(index, 1);
    for(const publishPath of values(publishPaths)) {
      await this.unpublishPipeline(publishPath, pipeline?.$meta?.name);
    }
    return {
      pipelines,
      pipeline: pipelines.length > 0 ? pipelines[0] : null
    };
  },
  onShare({pipeline, pipelines, publishPaths}, {selectedPublishKey}) {
    const name = pipeline?.$meta?.name;
    const value = pipeline?.json.replace(/\$/g, '*');
    if (name && value && publishPaths[selectedPublishKey]) {
      this.publishPipeline(publishPaths[selectedPublishKey], name, value);
      if (!pipeline?.$meta.isPublished) {
        return this.updatePipelineMeta({isPublished: true}, pipeline, pipelines);
      }
    }
  },
  onDontShare({pipeline, pipelines, publishPaths}) {
    for(const publishPath of values(publishPaths)) {
      this.unpublishPipeline(publishPath, pipeline.$meta.name);
    }
    return this.updatePipelineMeta({isPublished: false}, pipeline, pipelines);
  },
  publishPipeline(publishPath, name, body) {
    return fetch(this.makePublicPipelinesUrl(publishPath, name), {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body
    });
  },
  unpublishPipeline(path, name) {
    return fetch(this.makePublicPipelinesUrl(path, name), {method: 'DELETE'});
  },
  makePublicPipelinesUrl(path, name) {
    return `${path}${name}.json`;
  },
  onRenameClicked({}, state) {
    state.renaming = true;
  },
  onRename({eventlet: {value}, pipeline, pipelines}, state) {
    state.renaming = false;
    if (value !== pipeline.$meta.name) {
      if (this.isValidPipelineName(value)) {
        return this.updatePipelineMeta({name: value}, pipeline, pipelines);
      }
    }
  },
  isValidPipelineName(name) {
    return /^[a-zA-Z0-9 _-]*$/.test(name);
  },
  onRenameBlur({}, state) {
    state.renaming = false;
  },
  updatePipelineMeta(newData, pipeline, pipelines) {
    const index = this.findPipelineIndex(pipeline, pipelines);
    pipeline = {...pipeline, $meta: {...pipeline.$meta, ...newData}};
    pipelines[index] = pipeline;
    return {pipeline, pipelines};
  },
  findPipelineIndex(pipeline, pipelines) {
    return this.findPipelineByName(pipeline.$meta.name, pipelines);
  },
  findPipelineByName(name, pipelines) {
    return pipelines.findIndex(({$meta}) => $meta.name === name);
  },
  onPublishPathChanged({eventlet: {value}}, state) {
    state.selectedPublishKey = value;
  },
  template: html`
<style>
  :host {
    flex: none !important;
  }
  [toolbar] {
    padding: 0;
  }
  [chooser] {
    width: 150px;
  }
  [rename] {
    width: 150px;
  }
</style>
<div rows>
  <div toolbar>
    <span flex></span>
    <mwc-icon-button on-click="onNew" icon="add"></mwc-icon-button>
    <mwc-icon-button on-click="onCloneClicked" icon="content_copy"></mwc-icon-button>
    <mwc-icon-button on-click="onDelete" icon="delete" display$="{{showDeleteIcon}}"></mwc-icon-button>
    <div chooser rows frame="chooser" display$="{{showChooser}}"></div>
    <input rename type="text" value="{{name}}" display$="{{showRenameInput}}" autofocus on-change="onRename" on-blur="onRenameBlur">
    <mwc-icon-button on-click="onRenameClicked" display$="{{showRenameIcon}}" icon="edit"></mwc-icon-button>
    <select display$="{{showPublish}}" on-change="onPublishPathChanged" repeat="option_t">{{publishKeys}}</select>
    <mwc-icon-button on-click="onShare" icon="public" display$="{{showPublish}}"></mwc-icon-button>
    <mwc-icon-button on-click="onDontShare" icon="visibility_off" display$="{{showUnpublish}}"></mwc-icon-button>
  </div>
</div>

<template option_t>
  <option value="{{key}}" selected="{{selected}}">{{key}}</option>
</template>

  `
});
