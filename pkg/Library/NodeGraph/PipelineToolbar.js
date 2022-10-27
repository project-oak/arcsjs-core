/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
  async update(inputs, state, tools) {
    const {pipeline, pipelines} = inputs;
    const {service} = tools;
    const outputs = {};
    if (pipeline) {
      if (!deepEqual(pipeline, state.pipeline)) {
        if (state.pipeline?.$meta?.id !== pipeline.$meta.id) {
          await this.updateSelectedPipelineHistory(pipeline, service);
          outputs['selectedNodeId'] = keys(pipeline.nodes)?.[0];
        }
        state.pipeline = pipeline;
        assign(outputs, {
          pipeline,
          pipelines: this.updateItemInPipelines(pipeline, pipelines),
        });
      }
    } else {
      state.renaming = false;
      assign(outputs, await this.chooseOrCreatePipeline(pipelines, service));
    }
    assign(outputs, await this.handleEvent(inputs, state, tools));
    assign(outputs, {icons: this.toolbarIcons(inputs)});
    return outputs;
  },
  async chooseOrCreatePipeline(pipelines, service) {
    if (pipelines?.length > 0) {
      return {pipeline: pipelines[0]};
    } else {
      return this.addNewPipeline(pipelines, /* name */null, service);
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
  toolbarIcons() {
    // const isOwned = this.findPipelineIndex(pipeline, pipelines) >= 0;
    return [{
      icon: 'add',
      title: 'New Pipeline',
      key: 'onNew',
    }, {
      icon: 'delete',
      title: 'Delete Pipeline',
      key: 'onDelete',
      // hidden: !isOwned
    }, {
      icon: 'content_copy',
      title: 'Duplicate Pipeline',
      key: 'onCloneClicked'
    }];
  },
  async handleEvent(inputs, state, tools) {
    const {event, selectedNodeId} = inputs;
    if (event !== state.event) {
      state.event = event;
      if (event) {
        if (this[event]) {
          return {
            event: null,
            ...await this[event](inputs, state, tools),
          };
        }
        log(`Unhandled event '${event}' for ${selectedNodeId}`);
      }
    }
  },
  render({pipeline}, {renaming}) {
    return {
      showRenameInput: String(renaming),
      showRenameIcon: String(!renaming),
      showChooser: String(!renaming),
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
      values(currentPipeline.nodes).forEach(node => {
        pipeline.nodes[node.id] = {...node};
      });
      pipeline.position = this.copyPosition(pipeline.$meta.id, currentPipeline);
      return {pipeline, pipelines};
    }
  },
  copyPosition(id, {position}) {
    const result = {};
    keys(position).forEach(key => result[key] = {...position[key], id});
    return result;
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
  async onDelete({pipeline, pipelines}) {
    const index = this.findPipelineIndex(pipeline, pipelines);
    if (index >= 0) {
      pipelines?.splice(index, 1);
    }
    return {
      pipelines,
      pipeline: pipelines.length > 0 ? pipelines[0] : null,
      selectedNodeId: null
    };
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
  onRenameBlur(inputs, state) {
    state.renaming = false;
    return {icons: this.toolbarIcons(inputs, state)};
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
    height: 26px;
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
  <input rename type="text" value="{{name}}" display$="{{showRenameInput}}" autofocus on-change="onRename" on-blur="onRenameBlur">
  <mwc-icon-button title="Rename Pipeline" on-click="onRenameClicked" display$="{{showRenameIcon}}" icon="edit"></mwc-icon-button>
  <div column separator></div>
  <div chooser rows frame="buttons"></div>
</div>
`
});
