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
    const {graph, graphs, mediaDeviceState} = inputs;
    const {service} = tools;
    const outputs = {};
    if (graph) {
      if (!deepEqual(graph, state.graph)) {
        if (state.graph?.$meta?.id !== graph.$meta.id) {
          await this.updateSelectedGraphHistory(graph, service);
          outputs['selectedNodeId'] = keys(graph.nodes)?.[0];
          outputs['mediaDeviceState'] = this.resetMediaDeviceState(mediaDeviceState);
        }
        state.graph = graph;
        assign(outputs, {
          graph,
          graphs: this.updateItemInGraphs(graph, graphs),
        });
      }
    } else {
      state.renaming = false;
      assign(outputs, await this.chooseOrCreateGraph(graphs, service));
    }
    return {
      ...outputs,
      ...await this.handleEvent(inputs, state, tools),
      icons: this.toolbarIcons(inputs)
    };
  },
  async chooseOrCreateGraph(graphs, service) {
    if (graphs?.length > 0) {
      return {graph: graphs[0]};
    } else {
      return this.addNewGraph(graphs, /* name */null, service);
    }
  },
  async updateSelectedGraphHistory(graph, service) {
    const id = graph?.$meta?.id;
    return service({kind: 'HistoryService', msg: 'setSelectedGraph', data: {graph: id}});
  },
  resetMediaDeviceState(mediaDeviceState) {
    keys(mediaDeviceState).forEach(key => mediaDeviceState[key] = false);
    return mediaDeviceState;
  },
  updateItemInGraphs(graph, graphs) {
    const index = this.findGraphIndex(graph, graphs);
    if (index >= 0) {
      graphs[index] = graph;
    }
    return graphs;
  },
  async addNewGraph(graphs, newName, service) {
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
    } while (this.findGraphById(id, graphs));
    return id;
  },
  toolbarIcons() {
    // const isOwned = this.findGraphIndex(graph, graphs) >= 0;
    return [{
      icon: 'add',
      title: 'New Graph',
      key: 'onNew',
    },{
      icon: 'delete',
      title: 'Delete Graph',
      key: 'onDelete',
      // hidden: !isOwned
    },{
      icon: 'content_copy',
      title: 'Duplicate Graph',
      key: 'onCloneClicked'
    }];
  },
  async handleEvent(inputs, state, tools) {
    const {event, graph} = inputs;
    if (event !== state.event) {
      state.event = event;
      if (event) {
        if (this[event]) {
          return {
            event: null,
            ...await this[event](inputs, state, tools),
          };
        }
        log(`Unhandled event '${event}' for ${graph?.$meta.name}`);
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
    return this.addNewGraph(graphs, null, service);
  },
  async onCloneClicked({graph: currentGraph, graphs: currentGraphs}, state, {service}) {
    if (currentGraph) {
      const {graph, graphs} = await this.addNewGraph(
        currentGraphs,
        this.makeGraphCopyName(currentGraph.$meta?.name, currentGraphs),
        service);
      values(currentGraph.nodes).forEach(node => {
        graph.nodes[node.id] = {...node};
      });
      graph.position = this.copyPosition(graph.$meta.id, currentGraph);
      return {graph, graphs};
    }
  },
  copyPosition(id, {position}) {
    const result = {};
    keys(position).forEach(key => result[key] = {...position[key], id});
    return result;
  },
  makeGraphCopyName(name, graphs) {
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
    const index = this.findGraphIndex(graph, graphs);
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
      if (this.isValidGraphName(value)) {
        return this.updateGraphMeta({name: value}, graph, graphs);
      }
    }
  },
  isValidGraphName(name) {
    return /^[a-zA-Z0-9 _-]*$/.test(name);
  },
  onRenameBlur(inputs, state) {
    state.renaming = false;
    return {icons: this.toolbarIcons(inputs, state)};
  },
  updateGraphMeta(newData, graph, graphs) {
    const index = this.findGraphIndex(graph, graphs);
    graph = {...graph, $meta: {...graph.$meta, ...newData}};
    graphs[index] = graph;
    return {graph, graphs};
  },
  findGraphIndex(graph, graphs) {
    return graphs?.findIndex(({$meta}) => $meta.id === graph?.$meta?.id);
  },
  findGraphById(id, graphs) {
    return graphs?.find(({$meta}) => $meta.id === id);
  },
  findGraphByName(name, graphs) {
    return graphs?.find(({$meta}) => $meta.name === name);
  },
  template: html`
<style>
  :host {
    flex: none !important;
    --mdc-icon-button-size: 24px;
    --mdc-icon-size: 18px;
    --mdc-tab-height: 24px;
    /* --mdc-typography-button-font-size: 0.875em; */
  }
  [toolbar] {
    padding: 0 0 0 6px;
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

  <mwc-icon-button title="Rename Graph" on-click="onRenameClicked" display$="{{showRenameIcon}}" icon="edit"></mwc-icon-button>

  <div chooser rows display$="{{showChooser}}"><slot name="chooser"></slot></div>
  <input rename type="text" value="{{name}}" display$="{{showRenameInput}}" autofocus on-change="onRename" on-blur="onRenameBlur">

  <div column separator></div>

  <div chooser rows><slot name="buttons"></slot></div>

</div>
`
});
