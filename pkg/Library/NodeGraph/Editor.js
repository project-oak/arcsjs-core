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

  update({pipeline, selectedNode}, state) {
    if (pipeline?.$meta?.name !== state.selectedPipelineName) {
      state.selectedPipelineName = pipeline?.$meta.name;
      selectedNode = null;
    }
    if (!selectedNode && pipeline?.nodes?.length) {
      selectedNode = pipeline.nodes[0];
    }
    return {selectedNode};
  },

  findNodeType(name, nodeTypes) {
    return nodeTypes.find(({$meta}) => $meta.name === name);
  },

  render({pipeline, nodeTypes, categories, selectedNode}) {
    return {
      graphNodes: this.renderGraphNodes(pipeline?.nodes, selectedNode, nodeTypes, categories),
    };
  },

  renderGraphNodes(nodes, selectedNode, nodeTypes, categories) {
    const graph = {name: 'pipeline', children: []};
    const graphNodes = nodes?.map(node => {
      const nodeType = this.findNodeType(node.name, nodeTypes);
      const category = nodeType?.$meta?.category;
      return {
        key: node.key,
        name: this.nodeDisplay(node),
        color: this.colorByCategory(category, categories),
        bgColor: this.bgColorByCategory(category, categories),
        strokeWidth: node.key == selectedNode?.key ? 3 : 1,
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

  nodeDisplay({name, index}) {
    const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1);
    return `${capitalize(name)}${index > 1 ? ` ${index}` : ''}`;
  },

  colorByCategory(category, categories) {
    return categories?.[category]?.color || 'crimson';
  },

  bgColorByCategory(category, categories) {
    return categories?.[category]?.bgColor || 'lightgrey';
  },

  renderConnections(node) {
    if (node.connections) {
      const selectedCandidates = values(node.connections).map(conn => conn.candidates.find(c => c.selected));
      return selectedCandidates?.[0]?.from;
    }
  },

  onNodeRemove({eventlet: {key}, pipeline, selectedNode}) {
    pipeline.nodes = pipeline.nodes.filter(node => node.key !== key);
    return {
      pipeline,
      selectedNode: key === selectedNode.key ? null : pipeline.nodes.find(n => n.key === selectedNode.key)
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

  onNodeSelect({eventlet: {key}, pipeline}) {
    return {
      selectedNode: pipeline.nodes.find(node => node.key === key)
    };
  },

  onDrop({eventlet: {value}, pipeline, nodeTypes}) {
    if (pipeline) {
      const name = value.split(this.catalogDelimiter)[1];
      const nodeType = this.findNodeType(name, nodeTypes);
      const newNode = this.makeNewNode(nodeType, pipeline.nodes);
      pipeline.nodes = [...pipeline.nodes, newNode];
      return {pipeline};
    }
  },

  makeNewNode({$meta: {name}}, nodes) {
    const typedNodes = nodes.filter(node => name === node.name);
    const index = (typedNodes.length ? typedNodes[typedNodes.length - 1].index : 0) + 1;
    return {
      name,
      index,
      key: this.formatNodeKey({name, index}),
    };
  },

  formatNodeKey({name, index}) {
    return `${name}${index}`.replace(/ /g,'');
  },

  onDeleteAll({pipeline}) {
    pipeline.nodes = [];
    return {
      pipeline,
      selectedNode: null
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
  <div toolbar>
    <span flex></span>
    <mwc-icon-button on-click="onDeleteAll" icon="delete_forever"></mwc-icon-button>
  </div>
  <drop-target flex grid scrolling on-drop="onDrop">
    <node-graph nodes="{{graphNodes}}" on-select="onNodeSelect" on-delete="onNodeRemove"></node-graph>
  </drop-target>
  `
  });
