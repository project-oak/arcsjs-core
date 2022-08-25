/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
  async initialize({pipelines}, state, {service, output}) {
    pipelines = await this.backwardCompatibilityPipelines(pipelines, {service, output});
    const pipeline = await this.retrieveSelectedPipeline(pipelines, service);
    if (pipeline) {
      return {pipeline};
    } else {
      service({kind: 'HistoryService', msg: 'setSelectedPipeline', data: {pipeline: null}});
    }
  },
  async retrieveSelectedPipeline(pipelines, service) {
    const pipelineId = await service({kind: 'HistoryService', msg: 'retrieveSelectedPipeline'});
    let pipeline = this.findPipelineById(pipelineId, pipelines);
    if (!pipeline) {
      pipeline = await this.backwardCompatibilitySelectedPipeline(pipelineId, pipelines, service);
    }
    return pipeline;
  },
  async backwardCompatibilityPipelines(pipelines, {service, output}) {
    // Prior to 0.4.0 pipelines were created with `name` only.
    // This method backfills missing unique ids.
    if (pipelines?.some(({$meta}) => !$meta.id)) {
      pipelines = await Promise.all(pipelines.map(async p => {
        p.$meta.id = p.$meta.id || await this.makeUniqueId(pipelines, service);
        return p;
      }));
      await output({pipelines});
    }
    return pipelines;
  },
  async backwardCompatibilitySelectedPipeline(name, pipelines, service) {
    // Prior to 0.4.0 pipelines were created with `name` only, without a unique id.
    // This method selects pipeline by name found in the URL param.
    const pipeline = this.findPipelineByName(name, pipelines);
    if (pipeline) {
      await service({kind: 'HistoryService', msg: 'setSelectedPipeline', data: {pipeline: pipeline.$meta?.id}});
    }
    return pipeline;
  },
  async update({pipeline, pipelines, publishPaths}, state, {service}) {
    if (publishPaths?.length > 0 && !state.selectedPublishKey) {
      state.selectedPublishKey = keys(publishPaths)[0];
    }
    if (pipeline) {
      if (this.pipelineChanged(pipeline, state.pipeline)) {
        if (state.pipeline?.$meta?.id !== pipeline.$meta?.id) {
          await service({kind: 'HistoryService', msg: 'setSelectedPipeline', data: {pipeline: pipeline.$meta?.id}});
        }
        state.pipeline = pipeline;
        return {
          pipeline,
          pipelines: this.updateItemInPipelines(pipeline, pipelines)
        };
      }
    } else {
      state.renaming = false;
      return this.addNewPipeline(pipelines, /* name */null, service);
    }
  },
  pipelineChanged(pipeline, currentPipeline) {
    return JSON.stringify(pipeline) !== JSON.stringify(currentPipeline);
  },
  updateItemInPipelines(pipeline, pipelines) {
    const index = this.findPipelineIndex(pipeline, pipelines);
    if (index >= 0) {
      pipelines[index] = pipeline;
    }
    return pipelines;
  },
  async addNewPipeline(pipelines, newName, service) {
    const id = await this.makeUniqueId(pipelines, service);
    const name = await this.makeNewName(newName, service);
    const pipeline = {$meta: {name, id}, nodes: []};
    return {
      pipeline,
      pipelines: [...(pipelines || []), pipeline]
    };
  },
  async makeNewName(name, service) {
    return (name ?? await service({msg: 'MakeName'})) || 'new pipeline';
  },
  async makeUniqueId(pipelines, service) {
    let id = await service({msg: 'MakeId'});
    while (this.findPipelineById(id, pipelines)) {
      id = await service({msg: 'MakeId'});
    }
    return id;
  },
  render({pipeline, pipelines, publishPaths}, {renaming, selectedPublishKey}) {
    const isOwned = this.findPipelineIndex(pipeline, pipelines) >= 0;
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
    return this.addNewPipeline(pipelines, null, service);
  },
  async onCloneClicked({pipeline: currentPipeline, pipelines: currentPipelines}, state, {service}) {
    if (currentPipeline) {
      const {pipeline, pipelines} = await this.addNewPipeline(currentPipelines, `Copy of ${currentPipeline.$meta?.name}`, service);
      pipeline.nodes = currentPipeline.nodes.map(node => ({...node}));
      return {pipeline, pipelines};
    }
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
      pipeline: pipelines.length > 0 ? pipelines[0] : null
    };
  },
  onShare({pipeline, pipelines, publishPaths}, {selectedPublishKey}) {
    const id = pipeline?.$meta?.name;
    const value = pipeline?.json.replace(/\$/g, '*');
    if (id && value && publishPaths[selectedPublishKey]) {
      // Backward compatibility for pipelines published in versions < 0.4:
      this.unpublishPipeline(publishPaths[selectedPublishKey], pipeline.$meta.name, value);
      this.publishPipeline(publishPaths[selectedPublishKey], id, value);
      if (!pipeline?.$meta.isPublished) {
        return this.updatePipelineMeta({isPublished: true}, pipeline, pipelines);
      }
    }
  },
  onDontShare({pipeline, pipelines, publishPaths}) {
    for (const publishPath of values(publishPaths)) {
      this.unpublishPipeline(publishPath, pipeline.$meta.id);
      // Backward compatibility for pipelines published in versions < 0.4:
      this.unpublishPipeline(publishPath, pipeline.$meta.name);
    }
    return this.updatePipelineMeta({isPublished: false}, pipeline, pipelines);
  },
  publishPipeline(publishPath, id, body) {
    return fetch(this.makePublicPipelinesUrl(publishPath, id), {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body
    });
  },
  unpublishPipeline(path, id) {
    return fetch(this.makePublicPipelinesUrl(path, id), {method: 'DELETE'});
  },
  makePublicPipelinesUrl(path, id) {
    return `${path}${id}.json`;
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
    return pipelines?.findIndex(({$meta}) => $meta.id === pipeline?.$meta?.id);
  },
  findPipelineById(id, pipelines) {
    return pipelines?.find(({$meta}) => $meta.id === id);
  },
  findPipelineByName(name, pipelines) {
    return pipelines?.find(({$meta}) => $meta.name === name);
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
