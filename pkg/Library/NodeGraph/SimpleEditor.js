/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
 ({
  catalogDelimiter: '$$',

  update({pipeline, selectedNodeKey}, state) {
    if (pipeline?.$meta?.name !== state.selectedPipelineName) {
      state.selectedPipelineName = pipeline?.$meta.name;
      selectedNodeKey = null;
    }
    if (!selectedNodeKey && keys(pipeline?.nodes).length) {
      selectedNodeKey = keys(pipeline.nodes)[0].key;
    }
    return {selectedNodeKey};
  },

  render({pipeline, nodeTypes, categories, selectedNodeKey}) {
    return {
      graphNodes: this.renderGraphNodes(pipeline?.nodes, selectedNodeKey, nodeTypes, categories),
    };
  },

  renderGraphNodes(nodes, selectedNodeKey, nodeTypes, categories) {
    const graph = {name: 'pipeline', children: []};
    const graphNodes = nodes?.map(node => {
      const nodeType = nodeTypes[node.type];
      const category = nodeType?.$meta?.category;
      return {
        key: node.key,
        name: this.nodeDisplay(node),
        color: this.colorByCategory(category, categories),
        bgColor: this.bgColorByCategory(category, categories),
        strokeWidth: node.key == selectedNodeKey ? 3 : 1,
        conn: this.renderConnections(node),
        children: []
      };
    });
    graphNodes?.forEach(gn => {
      const parent = (gn.conn && graphNodes.find(p => p.key === gn.conn)) || graph;
      parent.children.push(gn);
    });
    return graph;
  },

  nodeDisplay(node) {
    return node.displayName || node.name;
  },

  colorByCategory(category, categories) {
    return categories?.[category]?.color || 'crimson';
  },

  bgColorByCategory(category, categories) {
    return categories?.[category]?.bgColor || 'lightgrey';
  },

  renderConnections(node) {
    const connections = values(node.connections)?.[0];
    return connections?.[0]?.from;
  },

  onNodeRemove({eventlet: {key}, pipeline, selectedNodeKey}) {
    delete pipeline.nodes[key];
    return {
      pipeline,
      selectedNodeKey: key === selectedNodeKey ? null : selectedNodeKey
    };
  },

  updateConnectionCandidates(node, name, candidates) {
    return {
      ...node,
      connections: {
        ...node.connections,
        [name]: {
          ...node.connections[name],
          candidates
        }
      }
    };
  },

  onNodeSelect({eventlet: {key}}) {
    return {selectedNodeKey: key};
  },

  onDrop({eventlet: {value}, pipeline, nodeTypes}) {
    if (pipeline) {
      const newNode = this.makeNewNode(value, pipeline, nodeTypes);
      pipeline.nodes[newNode.key] = this.makeNewNode(value, pipeline, nodeTypes);
      return {pipeline};
    }
  },

  makeNewNode(key, pipeline, nodeTypes) {
    const name = nodeTypes[key].$meta.name;
    const index = this.indexNewNode(key, pipeline.nodes);
    return {
      type: key,
      index,
      key: this.formatNodeKey(key, index),
      name: this.displayName(name, index)
    };
  },

  indexNewNode(key, nodes) {
    const typedNodes = values(nodes).filter(node => key === node.type);
    return (typedNodes.pop()?.index || 0) + 1;
  },

  displayName(name, index) {
    const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1);
    return `${capitalize(name)}${index > 1 ? ` ${index}` : ''}`;
  },

  formatNodeKey(key, index) {
    return `${key}${index}`.replace(/ /g,'');
  },

  onDeleteAll({pipeline}) {
    pipeline.nodes = {};
    return {
      pipeline,
      selectedNodeKey: null
    };
  },

  template: html`
  <style>
    :host {
      color: black;
      background-color: var(--theme-color-bg-1);
      display: block;
      height: 100%;
      font-size: 12px;
      --edge-border: 1px solid #555;
      --mdc-icon-size: 18px;
      --mdc-icon-button-size: 26px;
    }
    mwc-icon-button {
      color: #555;
    }
    [node] {
      border: var(--edge-border);
      background: #fdfdfd;
      cursor: pointer;
      margin: 14px 20px;
      min-width: 100px;
      border-radius: 6px;
      overflow: hidden;
    }
    [node][selected] {
      margin: 12px 18px;
      border-width: 3px;
    }
    [category="input"] {
      background-color: #e9f2e4;
      border-color: green;
    }
    [category="model"] {
      background-color: #fbe5c2;
      border-color: orange;
    }
    [category="effect"] {
      background-color: #e7d2fc;
      border-color: purple;
    }
    [category="output"] {
      background-color: #c8d8f5;
      border-color: blue;
    }
    [category="misc"] {
      background-color: lightgrey;
      border-color: grey;
    }
  </style>
  <!-- <div toolbar>
    <span flex></span>
    <mwc-icon-button on-click="onDeleteAll" icon="delete_forever"></mwc-icon-button>
  </div> -->
  <drop-target flex grid scrolling on-target-drop="onDrop">
    <node-graph nodes="{{graphNodes}}" on-select="onNodeSelect" on-delete="onNodeRemove"></node-graph>
  </drop-target>
  `
  });
