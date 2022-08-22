/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
  async update({pipeline, pipelines, publishPaths}, state, {service}) {
    if (publishPaths?.length > 0 && !state.selectedPublishKey) {
      state.selectedPublishKey = keys(publishPaths)[0];
    }
    if (pipeline) {
      if (this.updateItemInPipelines(pipeline, pipelines)) {
        service({msg: 'SetSelectedPipeline', data: {pipeline: pipeline.$meta?.name}});
        return {pipelines};
      }
    } else {
      state.renaming = false;
      pipeline = await this.makeNewPipeline(null, service);
      return {pipeline, pipelines: [...(pipelines || []), pipeline]};
    }
  },
  updateItemInPipelines(pipeline, pipelines) {
    const index = this.findPipelineIndex(pipeline, pipelines);
    if (index < 0) {
      pipelines[index] = pipeline;
      return true;
    }
  },
  async makeNewPipeline(name, service) {
    name = (name ?? await service({msg: 'MakeName'})) || 'new pipeline';
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
      showUnpublish: String(Boolean(pipeline?.$meta?.isPublished) && isOwned),
      name: pipeline?.$meta?.name
    };
  },
  async onNew({pipelines}, state, {service}) {
    const pipeline = await this.makeNewPipeline(null, service);
    return {
      pipeline,
      pipelines: [...(pipelines || []), pipeline]
    };
  },
  async onCloneClicked({pipeline, pipelines}) {
    const clonedPipeline = await this.makeNewPipeline(`Copy of ${pipeline.$meta?.name}`);
    clonedPipeline.nodes = [...pipeline?.nodes];
    return {
      pipeline: clonedPipeline,
      pipelines: [...(pipelines || []), clonedPipeline]
    };
  },
  async onDelete({pipeline, pipelines, publishPaths}) {
    const index = this.findPipelineIndex(pipeline, pipelines);
    if (index >= 0) {
      pipelines?.splice(index, 1);
    }
    for(const publishPath of values(publishPaths)) {
      await this.unpublishPipeline(publishPath, pipeline?.$meta?.name);
    }
    return {
      pipelines,
      pipeline: pipelines?.[0]
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
    for (const publishPath of values(publishPaths)) {
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
    if (pipeline && value !== pipeline.$meta.name) {
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
    return this.findPipelineByName(pipeline?.$meta?.name, pipelines);
  },
  findPipelineByName(name, pipelines) {
    return pipelines?.findIndex?.(({$meta}) => $meta?.name === name);
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
  [chooser], [rename] {
    font-size: 0.8rem;
    min-width: 170px;
  }
  [separator] {
    width: 2px;
    height: 32px;
    border-right: 1px solid #bbb;
  }
  select {
    font-family: 'Google Sans', sans-serif;
    font-size: 0.8rem;
    padding: 3px 6px;
    border-radius: 6px;
  }
</style>

<div toolbar>
  <div chooser rows frame="chooser" display$="{{showChooser}}"></div>
  <div column separator></div>
  <mwc-icon-button title="New Pipeline" on-click="onNew" icon="add"></mwc-icon-button>
  <mwc-icon-button title="Duplicate Pipeline" on-click="onCloneClicked" icon="content_copy"></mwc-icon-button>
  <mwc-icon-button title="Delete Pipeline" on-click="onDelete" icon="delete" display$="{{showDeleteIcon}}"></mwc-icon-button>
  <input rename type="text" value="{{name}}" display$="{{showRenameInput}}" autofocus on-change="onRename" on-blur="onRenameBlur">
  <mwc-icon-button title="Rename Pipeline" on-click="onRenameClicked" display$="{{showRenameIcon}}" icon="edit"></mwc-icon-button>
  <div column separator></div>
  <select title="Publish Target" display$="{{showPublish}}" on-change="onPublishPathChanged" repeat="option_t">{{publishKeys}}</select>
  <mwc-icon-button title="Publish Pipeline" on-click="onShare" icon="public" display$="{{showPublish}}"></mwc-icon-button>
  <mwc-icon-button title="Unpublish Pipeline" on-click="onDontShare" icon="visibility_off" display$="{{showUnpublish}}"></mwc-icon-button>
</div>

<template option_t>
  <option value="{{key}}" selected="{{selected}}">{{key}}</option>
</template>
`
});
