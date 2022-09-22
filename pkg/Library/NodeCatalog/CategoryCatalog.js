/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
initialize({nodeTypes}, state) {
  state.selectedCategory = nodeTypes?.[0]?.$meta?.category;
},

update({nodeTypes, search}, state) {
  return this.selectCategory(nodeTypes, state.selectedCategory, search);
},

selectCategory(nodeTypes, category, search) {
  return {
    selectedNodeTypes: this.filter(nodeTypes, category, search)
  };
},

filter(nodeTypes, category, search) {
  const matchSearch = (name) => (!search || name.toLowerCase().includes(search.toLowerCase()));
  return nodeTypes.filter(({$meta}) => ($meta.category === category && matchSearch($meta.name)));
},

render({nodeTypes, categories, search}, state) {
  return {
    nodeGroups: this.groupByCategory(nodeTypes, categories, search, state)
  };
},

groupByCategory(nodeTypes, categories, search, state) {
  const groups = [];
  nodeTypes.forEach(({$meta: {category}}) => this.requireGroup(category, groups, categories));
  groups.forEach(group => {
    const selected = group.category === state.selectedCategory;
    const numSearchResults = search ? this.filter(nodeTypes, group.category, search)?.length : 0;
    assign(group, {
      selected,
      colorStyle: {color: selected ? this.colorByCategory(group.category, categories) : 'inherit'},
      numSearchResults,
      hideSearchCount: numSearchResults === 0
    });
  });
  return groups;
},

requireGroup(category, groups, categories) {
  return this.findGroup(category, groups) ?? this.createGroup(category, groups, categories);
},

findGroup(category, groups) {
  return groups.find(g => g.category === category);
},

createGroup(category, groups, categories) {
  const group = {
    category,
    icon: this.iconByCategory(category, categories),
  };
  groups.push(group);
  return group;
},

iconByCategory(category, categories) {
  return categories?.[category]?.icon || 'star_outline';
},

colorByCategory(category, categories) {
  return categories?.[category]?.color || 'crimson';
},

onClickCategory({eventlet: {key}, nodeTypes, search}, state) {
  state.selectedCategory = key;
  return this.selectCategory(nodeTypes, state.selectedCategory, search);
},

template: html`
<style>
  :host {
    height: 100%;
    overflow: hidden;
  }
  [category-container] {
    display: flex;
    flex-direction: column;
    color: var(--theme-color-fg-0);
    background-color: var(--theme-color-bg-2);
    height: 100%;
    flex-shrink: 0;
    overflow-y: auto;
  }
  [category] {
    width: 72px;
    height: 72px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
  }
  [category]:hover {
    background-color: var(--theme-color-bg-3);
  }
  [category][selected] {
    background-color: var(--theme-color-bg-0);
  }
  [category-name] {
    font-size: 14px;
    font-weight: 500;
    text-transform: capitalize;
    padding: 4px 0;
  }
  icon {
    font-size: 19px;
  }
  [search-count-container] {
    position: absolute;
    top: 5px;
    right: 16px;
    font-size: 11px;
    background: #B3261E;
    width: 18px;
    height: 18px;
    border-radius: 9px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

<div category-container>
  <div repeat="category_t">{{nodeGroups}}</div>
</div>

<template category_t>
  <div category
       key="{{category}}"
       selected$="{{selected}}"
       on-click="onClickCategory">
    <icon xen:style="{{colorStyle}}">{{icon}}</icon>
    <div category-name>{{category}}</div>
    <div search-count-container
         hide$="{{hideSearchCount}}">{{numSearchResults}}</div>
  </div>
</template>

`
});
