/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
update(inputs, state) {
  state.groups = this.groupByCategory(inputs);
},

groupByCategory({nodeTypes, search, categories}) {
  const matchSearch = (name) => (!search || name.toLowerCase().includes(search.toLowerCase()));
  const groups = {};
  values(nodeTypes).forEach(({$meta: {id, category, displayName}}) => {
    if (matchSearch(displayName || id)) {
      const group = this.requireGroup(category, groups, categories);
      group.nodeTypes.push({
        id,
        displayName: displayName || id
      });
    }
  });
  values(groups).forEach(group => group.nodeTypes = group.nodeTypes.sort(this.sortNodeTypes));
  return values(groups);
},

requireGroup(category, groups, categories) {
  return groups[category] ?? this.createGroup(category, groups, categories);
},

createGroup(category, groups, categories) {
  const group = {
    category,
    style: this.categoryStyle(category, categories),
    nodeTypes: []
  };
  groups[category] = group;
  return group;
},

categoryStyle(category, categories) {
  const color = this.colorByCategory(category, categories);
  const backgroundColor = this.bgColorByCategory(category, categories);
  return {
    backgroundColor,
    borderTop: `1px solid ${color}`
  };
},

colorByCategory(category, categories) {
  return categories?.[category]?.color || 'crimson';
},

bgColorByCategory(category, categories) {
  return categories?.[category]?.bgColor || 'lightgrey';
},

render({}, {groups, showInfoPanel, infoPanelPos}) {
  return {
    groups,
    hideNoMatchedNodesLabel: groups?.length !== 0,
    showInfoPanel: String(Boolean(showInfoPanel)),
    infoPanelContainerStyle: {
      top: `${infoPanelPos?.top || 0}px`,
      left: `${infoPanelPos?.left || 0}px`
    }
  };
},

sortNodeTypes({displayName}, {displayName: otherDisplayName}) {
  return displayName.toLowerCase().localeCompare(otherDisplayName.toLowerCase());
},

async onItemClick({eventlet: {key: type}, graph, newNodeInfos}) {
  if (graph) {
    return {
      newNodeInfos: [...(newNodeInfos || []), {type}]
    };
  }
},

onHoverNodeType({eventlet: {key, value}, nodeTypes}, state) {
  assign(state, {
    showInfoPanel: true,
    infoPanelPos: value
  });
  return {
    hoveredNodeType: nodeTypes[key],
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
    --nodelist-bg: var(--node-list-bg, var(--theme-color-bg-2));
    --nodelist-container-fg: var(--nodelist-container-fg, var(--theme-color-fg-3));
    --nodelist-container-hi: var(--nodelist-container-hi, var(--theme-color-bg-3));
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
    font-feature-settings: "liga";
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
    box-shadow: 0px 1px 2px rgba(60, 64, 67, 0.3), 0px 2px 6px 2px rgba(60, 64, 67, 0.15);
    border-radius: 8px;
    min-width: 200px;
    max-width: 320px;
  }
  nodetype-info-panel {
    display: none;
  }
  [category] {
    font-weight: bold;
    font-size: 0.8em;
    padding: 8px 12px;
    /* border-top: 1px solid var(--nodelist-container-fg); */
  }
</style>

<div nodetypes-container>
  <div repeat="group_t">{{groups}}</div>
  <div no-matched-nodes hide$="{{hideNoMatchedNodesLabel}}">No matched nodes</div>
</div>

<div info-panel-container xen:style="{{infoPanelContainerStyle}}" display$="{{showInfoPanel}}">
  <div frame="typeInfo"></div>
</div>

<template group_t>
  <div>
    <div category xen:style="{{style}}">{{category}}</div>
    <div repeat="nodetype_t">{{nodeTypes}}</div>
  </div>
</template>

<template nodetype_t>
  <draggable-item key="{{id}}" name="{{displayName}}"
    on-enter="onHoverNodeType" on-leave="onMouseOutNodeType"
    on-item-clicked="onItemClick"></draggable-item>
</template>

`
});
