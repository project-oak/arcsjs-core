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
    const {graph, graphs} = inputs;
    const {service} = tools;
    const outputs = {};
    if (graph) {
      if (!deepEqual(graph, state.graph)) {
        if (state.graph?.$meta?.id !== graph.$meta.id) {
          await this.updateSelectedPipelineHistory(graph, service);
          outputs['selectedNodeId'] = keys(graph.nodes)?.[0];
        }
        state.graph = graph;
        assign(outputs, {
          graph,
          graphs: this.updateItemInPipelines(graph, graphs),
        });
      }
    } else {
      state.renaming = false;
      assign(outputs, await this.chooseOrCreatePipeline(graphs, service));
    }
    assign(outputs, await this.handleEvent(inputs, state, tools));
    assign(outputs, {icons: this.toolbarIcons(inputs)});
    return outputs;
  },
  async chooseOrCreatePipeline(graphs, service) {
    if (graphs?.length > 0) {
      return {graph: graphs[0]};
    } else {
      return this.addNewPipeline(graphs, /* name */null, service);
    }
  },
  async updateSelectedPipelineHistory(graph, service) {
    return service({
      kind: 'HistoryService',
      msg: 'setSelectedPipeline',
      data: {
        graph: graph?.$meta?.id
      }
    });
  },
  updateItemInPipelines(graph, graphs) {
    const index = this.findPipelineIndex(graph, graphs);
    if (index >= 0) {
      graphs[index] = graph;
    }
    return graphs;
  },
  async addNewPipeline(graphs, newName, service) {
    const id = await this.makeUniqueId(graphs, service);
    const name = await this.makeNewName(newName, service);
    const graph = {$meta: {name, id}, nodes: {}};
    return {
      graph,
      graphs: [...(graphs || []), graph]
    };
  },
  async makeNewName(name, service) {
    return (name ?? await service({msg: 'MakeName'})) || 'new graph';
  },
  async makeUniqueId(graphs, service) {
    let id;
    do {
      id = await service({msg: 'MakeId'});
    } while (this.findPipelineById(id, graphs));
    return id;
  },
  toolbarIcons() {
    // const isOwned = this.findPipelineIndex(graph, graphs) >= 0;
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
  render({graph}, {renaming}) {
    return {
      showRenameInput: String(Boolean(renaming)),
      showRenameIcon: String(!renaming),
      showChooser: String(!renaming),
      name: graph?.$meta?.name
    };
  },
  async onNew({graphs}, state, {service}) {
    return this.addNewPipeline(graphs, null, service);
  },
  async onCloneClicked({graph: currentPipeline, graphs: currentPipelines}, state, {service}) {
    if (currentPipeline) {
      const {graph, graphs} = await this.addNewPipeline(
        currentPipelines,
        this.makePipelineCopyName(currentPipeline.$meta?.name, currentPipelines),
        service);
      values(currentPipeline.nodes).forEach(node => {
        graph.nodes[node.id] = {...node};
      });
      graph.position = this.copyPosition(graph.$meta.id, currentPipeline);
      return {graph, graphs};
    }
  },
  copyPosition(id, {position}) {
    const result = {};
    keys(position).forEach(key => result[key] = {...position[key], id});
    return result;
  },
  makePipelineCopyName(name, graphs) {
    // Copies of a graph are named:
    // 'Foo', 'Copy of Foo', 'Copy (2) of Foo', etc
    // Copy of 'Copy (N) of Foo' will be named 'Copy (M) of Foo'.

    const regexp = (nameRegex) => new RegExp(`Copy (?:\\(([0-9]+)\\) )?of ${nameRegex}`);
    const match = name.match(regexp('([a-zA-Z\\-]+)'));
    const nameBase = match?.length > 0 ? match?.[match.length - 1] : name;
    const copyRegex = regexp(nameBase);
    const names = graphs.map(({$meta: {name}}) => name.match(copyRegex))
      .filter(match => Boolean(match))
      .map(match => Number(match?.[1] || 1));
    const maxCopy = Math.max(...names);
    return `Copy ${maxCopy >= 0 ? `(${maxCopy + 1}) `: ''}of ${nameBase}`;
  },
  async onDelete({graph, graphs}) {
    const index = this.findPipelineIndex(graph, graphs);
    if (index >= 0) {
      graphs?.splice(index, 1);
    }
    return {
      graphs,
      graph: graphs.length > 0 ? graphs[0] : null,
      selectedNodeId: null
    };
  },
  onRenameClicked({}, state) {
    state.renaming = true;
  },
  onRename({eventlet: {value}, graph, graphs}, state) {
    state.renaming = false;
    if (graph && value !== graph.$meta.name) {
      if (this.isValidPipelineName(value)) {
        return this.updatePipelineMeta({name: value}, graph, graphs);
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
  updatePipelineMeta(newData, graph, graphs) {
    const index = this.findPipelineIndex(graph, graphs);
    graph = {...graph, $meta: {...graph.$meta, ...newData}};
    graphs[index] = graph;
    return {graph, graphs};
  },
  findPipelineIndex(graph, graphs) {
    return graphs?.findIndex(({$meta}) => $meta.id === graph?.$meta?.id);
  },
  findPipelineById(id, graphs) {
    return graphs?.find(({$meta}) => $meta.id === id);
  },
  findPipelineByName(name, graphs) {
    return graphs?.find(({$meta}) => $meta.name === name);
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
