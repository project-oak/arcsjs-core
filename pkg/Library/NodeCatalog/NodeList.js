/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

update({selectedNodeTypes}, state) {
  state.nodeTypeList = values(selectedNodeTypes).sort(this.sortNodeTypes);
},

render({}, {nodeTypeList, showInfoPanel, infoPanelTop}) {
  return {
    nodeTypes: this.renderNodeTypes(nodeTypeList),
    hideNoMatchedNodesLabel: nodeTypeList.length !== 0,
    showInfoPanel: String(Boolean(showInfoPanel)),
    infoPanelContainerStyle: {top: `${infoPanelTop}px`}
  };
},

renderNodeTypes(nodeTypeList) {
  return nodeTypeList.map(this.renderNodeType.bind(this));
},

renderNodeType({$meta: {name, key}}) {
  return {name, key};
},

sortNodeTypes(t1, t2) {
  return t1.$meta.name.toLowerCase().localeCompare(t2.$meta.name.toLowerCase());
},

async onItemClick({eventlet: {key}, selectedNodeTypes, pipeline}) {
  if (pipeline) {
    // TODO(mariakleiner): nodes should be a map!
    pipeline.nodes = [
      ...pipeline.nodes,
      this.makeNewNode(key, this.indexNewNode(key, pipeline.nodes), selectedNodeTypes)
    ];
    return {pipeline};
  }
},

makeNewNode(key, index, nodeTypes) {
  const name = nodeTypes[key].$meta.name;
  return {
    type: key,
    index,
    key: this.formatNodeKey(key, index),
    name: this.displayName(name, index)
  };
},

indexNewNode(key, nodes) {
  const typedNodes = nodes.filter(node => key === node.type);
  return (typedNodes.pop()?.index || 0) + 1;
},

displayName(name, index) {
  const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1);
  return `${capitalize(name)}${index > 1 ? ` ${index}` : ''}`;
},

formatNodeKey(key, index) {
  return `${key}${index}`.replace(/ /g,'');
},

onHoverNodeType({eventlet: {key, value}, selectedNodeTypes}, state) {
  assign(state, {
    showInfoPanel: true,
    infoPanelTop: value
  });
  return {
    hoveredNodeType: selectedNodeTypes[key],
  };
},

onMouseOutNodeType(inputs, state) {
  state.showInfoPanel = false;
  return {hoverEvent: null};
},

template: html`
<style>
  :host {
    /* theme variables */
    /* --nodelist-bg: #f8f9fa; */
    --nodelist-bg: var(--node-list-bg, --theme-color-bg-2);
    --nodelist-container-fg: var(--nodelist-container-fg, --theme-color-fg-3);
    --nodelist-container-hi: var(--nodelist-container-hi, --theme-color-bg-3);
  }
  :host {
    background-color: var(--nodelist-bg);
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
    color: var(--nodelist-container-fg);
  }
  [container]:hover {
    background: var(--nodelist-container-hi);
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

<div info-panel-container xen:style="{{infoPanelContainerStyle}}" display$="{{showInfoPanel}}">
  <div frame="typeInfo"></div>
</div>

<template nodetype_t>
  <draggable-item key="{{key}}" name="{{name}}"
    on-enter="onHoverNodeType" on-leave="onMouseOutNodeType"
    on-item-clicked="onItemClick"></draggable-item>
</template>

`
});
