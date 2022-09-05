/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
catalogDelimiter: '$$',

render({selectedNodeTypes}, {showInfoPanel, infoPanelTop}) {
  return {
    nodeTypes: this.renderNodeTypes(selectedNodeTypes),
    hideNoMatchedNodesLabel: selectedNodeTypes.length !== 0,
    showInfoPanel: String(Boolean(showInfoPanel)),
    infoPanelContainerStyle: {top: `${infoPanelTop}px`}
  };
},

renderNodeTypes(nodeTypes) {
  return nodeTypes.sort(this.sortNodeTypes).map(this.renderNodeType.bind(this));
},

renderNodeType({$meta}) {
  return {name: $meta.name, key: this.keyFromMeta($meta)};
},

sortNodeTypes(t1, t2) {
  return t1.$meta.name.toLowerCase().localeCompare(t2.$meta.name.toLowerCase());
},

keyFromMeta({category, name}) {
  return `${category}${this.catalogDelimiter}${name}`;
},

async onItemClick({eventlet: {key}, selectedNodeTypes, pipeline}) {
  if (pipeline) {
    const [category, type] = key.split(this.catalogDelimiter);
    const newNode = this.indexNewNode(type, selectedNodeTypes, pipeline.nodes);
    pipeline.nodes = [...pipeline.nodes, newNode];
    return {pipeline};
  }
},

indexNewNode(type, nodeTypes, existingNodes) {
  const nodeType = this.findNodeType(type, nodeTypes);
  const name = nodeType.$meta.name;
  const typedNodes = existingNodes.filter(node => name === node.name);
  const index = (typedNodes.length ? typedNodes[typedNodes.length - 1].index : 0) + 1;
  return {
    name,
    type,
    index,
    key: this.formatNodeKey({name, index}),
    position: {}
  };
},

findNodeType(type, nodeTypes) {
  return nodeTypes.find(({$meta: {name}}) => name === type);
},

findNodeTypeIndex(node, nodeTypes) {
  return nodeTypes.findIndex(({$meta: {name}}) => node.name === name);
},

formatNodeKey({name, index}) {
  return `${name}${index}`.replace(/ /g,'');
},

onHoverNodeType({eventlet: {key, value}, selectedNodeTypes}, state) {
  const [category, name] = key.split(this.catalogDelimiter);
  state.showInfoPanel = true;
  // 44 is the height of the toolbar.
  state.infoPanelTop = value + 44;
  const index = this.findNodeTypeIndex({name, category}, selectedNodeTypes.sort(this.sortNodeTypes));
  return {
    hoveredNodeType: selectedNodeTypes[index],
  };
},

onMouseOutNodeType(inputs, state) {
  state.showInfoPanel = false;
  return {hoverEvent: null};
},

template: html`
<style>
  :host {
    background-color: #f8f9fa;
    height: 100%;
    overflow: hidden;
  }
  [nodetypes-container] {
    overflow-y: auto;
  }
  [no-matched-nodes] {
    font-size: 12px;
    color: #aaa;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
  }
  [container] {
    position: relative;
    cursor: grab;
    padding: 9px 0 9px 30px;
    color: var(--theme-color-fg-4);
  }
  [container]:hover {
    background: var(--theme-color-bg-4);
  }

  [container]:hover icon {
    display: flex;
    align-items: center;
  }
  icon {
    display: none;
    font-family: "Material Icons";
    font-style: normal;
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
    cursor: pointer;
    user-select: none;
    flex-shrink: 0;
    vertical-align: middle;
    overflow: hidden;
    pointer-events: none;
    height: 100%;
    align-items: center;
    top: 0;
    left: 9px;
    position: absolute;
  }
  [label] {
    font-size: 12px;
    font-weight: normal;
    line-height: 14px;
    text-transform: capitalize;
  }
  [container]:hover {
    background-color: #e0e1e2;
  }
  [info-panel-container] {
    position: fixed;
    background: white;
    z-index: 1000;
    left: 250px;
    padding: 12px;
    box-shadow: 0px 1px 2px rgba(60, 64, 67, 0.3), 0px 2px 6px 2px rgba(60, 64, 67, 0.15);
    border-radius: 8px;
    max-width: 320px;
  }
  nodetype-info-panel {
    display: none;
  }
</style>
<div nodetypes-container>
  <div repeat="nodetype_t">{{nodeTypes}}</div>
  <div no-matched-nodes hide$="{{hideNoMatchedNodesLabel}}">No matched nodes</div>
</div>
<div info-panel-container xen:style="{{infoPanelContainerStyle}}"
     display$="{{showInfoPanel}}">
  <div frame="typeInfo"></div>
</div>

<template nodetype_t>
  <draggable-item key="{{key}}"
                  name="{{name}}"
                  on-enter="onHoverNodeType"
                  on-leave="onMouseOutNodeType"
                  on-item-clicked="onItemClick">
 </draggable-item>
</template>

`
});
