/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
  async initialize({pipelines, publishPaths}, state, {service}) {
    const publicPipelines = await this.fetchPublicPipelines(publishPaths);
    const pipeline = await this.retrieveSelectedPipeline(pipelines, publicPipelines, service);
    if (!pipeline) {
      await this.updateSelectedPipelineHistory(null, service);
    }
    return {pipeline, publicPipelines};
  },
  async fetchPublicPipelines(urls) {
    const pipelines = (await Promise.all(values(urls).map(url => this.fetchPublicPipelinesFromUrl(url)))).flat();
    const names = {};
    return pipelines.filter(({$meta: {name}}) => {
      if (names[name]) {
        return false;
      }
      names[name] = true;
      return true;
    });
  },
  async fetchPublicPipelinesFromUrl(url) {
    if (url) {
      try {
        if (url.endsWith('/')) {
          url = `${url.substring(0, url.length - 1)}.json`;
        }
        const res = await fetch(url);
        if (res.status === 200) {
          const text = await res.text();
          if (text) {
            return values(JSON.parse(text.replace(/"\*/g, '"$')) ?? Object);
          }
        }
      } catch (e) {
        log(`Failed fetching pipelines from ${url} (${e.toString()})`);
      }
    }
  },
  async retrieveSelectedPipeline(pipelines, publicPipelines, service) {
    const pipelineId = await service({kind: 'HistoryService', msg: 'retrieveSelectedPipeline'});
    return this.findPipelineById(pipelineId, pipelines) ||
           this.findPipelineById(pipelineId, publicPipelines);
  },
  async update({pipeline, pipelines, publishPaths}, state, {service}) {
    if (publishPaths?.length > 0 && !state.selectedPublishKey) {
      state.selectedPublishKey = keys(publishPaths)[0];
    }
    if (pipeline) {
      if (!deepEqual(pipeline, state.pipeline)) {
        const outputs = {};
        if (state.pipeline?.$meta?.id !== pipeline.$meta.id) {
          await this.updateSelectedPipelineHistory(pipeline, service);
          assign(outputs, this.computeLayouts(pipeline));
          outputs['selectedNodeKey'] = keys(pipeline.nodes)?.[0];
        }
        state.pipeline = pipeline;
        assign(outputs, {
          pipeline,
          pipelines: this.updateItemInPipelines(pipeline, pipelines)
        });
        return outputs;
      }
    } else {
      state.renaming = false;
      if (pipelines?.length > 0) {
        return {pipeline: pipelines[0]};
      } else {
        return this.addNewPipeline(pipelines, /* name */null, service);
      }
    }
  },
  async updateSelectedPipelineHistory(pipeline, service) {
    return service({
      kind: 'HistoryService',
      msg: 'setSelectedPipeline',
      data: {
        pipeline: pipeline?.$meta?.id
      }
    });
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
    const pipeline = {$meta: {name, id}, nodes: {}};
    return {
      pipeline,
      pipelines: [...(pipelines || []), pipeline]
    };
  },
  async makeNewName(name, service) {
    return (name ?? await service({msg: 'MakeName'})) || 'new pipeline';
  },
  async makeUniqueId(pipelines, service) {
    let id;
    do {
      id = await service({msg: 'MakeId'});
    } while (this.findPipelineById(id, pipelines));
    return id;
  },
  render({pipeline, pipelines, publishPaths, publicPipelinesUrl}, {renaming, selectedPublishKey}) {
    const isOwned = this.findPipelineIndex(pipeline, pipelines) >= 0;
    const publishKeys = keys(publishPaths || {}).map(key => ({key, selected: key === selectedPublishKey}));
    const showRefreshIcon = String(Boolean(publicPipelinesUrl));
    return {
      showRenameIcon: String(!renaming && isOwned),
      showRenameInput: String(Boolean(renaming) && isOwned),
      showChooser: String(!renaming),
      showDeleteIcon: String(isOwned),
      showRefreshIcon,
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
      const {pipeline, pipelines} = await this.addNewPipeline(
        currentPipelines,
        this.makePipelineCopyName(currentPipeline.$meta?.name, currentPipelines),
        service);
      values(currentPipeline).forEach(node => {
        pipeline.nodes[node.key] = {...node};
      });
      return {pipeline, pipelines};
    }
  },
  makePipelineCopyName(name, pipelines) {
    // Copies of a pipeline are named:
    // 'Foo', 'Copy of Foo', 'Copy (2) of Foo', etc
    // Copy of 'Copy (N) of Foo' will be named 'Copy (M) of Foo'.

    const regexp = (nameRegex) => new RegExp(`Copy (?:\\(([0-9]+)\\) )?of ${nameRegex}`);
    const match = name.match(regexp('([a-zA-Z\\-]+)'));
    const nameBase = match?.length > 0 ? match?.[match.length - 1] : name;
    const copyRegex = regexp(nameBase);
    const names = pipelines.map(({$meta: {name}}) => name.match(copyRegex))
      .filter(match => Boolean(match))
      .map(match => Number(match?.[1] || 1));
    const maxCopy = Math.max(...names);
    return `Copy ${maxCopy >= 0 ? `(${maxCopy + 1}) `: ''}of ${nameBase}`;
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
      pipeline: pipelines.length > 0 ? pipelines[0] : null,
      selectedNodeKey: null
    };
  },
  onShare({pipeline, pipelines, publishPaths}, {selectedPublishKey}) {
    const id = pipeline?.$meta?.name;
    const value = pipeline?.json.replace(/\$/g, '*');
    if (id && value && publishPaths[selectedPublishKey]) {
      this.publishPipeline(publishPaths[selectedPublishKey], id, value);
      if (!pipeline?.$meta.isPublished) {
        return this.updatePipelineMeta({isPublished: true}, pipeline, pipelines);
      }
    }
  },
  onDontShare({pipeline, pipelines, publishPaths}) {
    for (const publishPath of values(publishPaths)) {
      this.unpublishPipeline(publishPath, pipeline.$meta.id);
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
  async onRefresh({publicPipelinesUrl}) {
    const publicPipelines = await this.fetchPublicPipelines(publicPipelinesUrl);
    return {publicPipelines};
  },
  computeLayouts(pipeline) {
    return {
      nodegraphLayout: assign({id: pipeline.$meta.id}, pipeline.position?.['nodegraphLayout']),
      previewLayout: assign({id: pipeline.$meta.id}, pipeline.position?.['previewLayout']),
    };
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
  <mwc-icon-button title="Refresh Pipeline List" icon="refresh" display$={{showRefreshIcon}} on-click="onRefresh"></mwc-icon-button>
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
