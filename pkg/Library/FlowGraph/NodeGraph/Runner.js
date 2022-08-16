/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

runnerDelimiter: '$$',

async initialize(inputs, state) {
  state.recipes = {};
  state.stores = {};
},

async update({recipes}, state, {service}) {
  recipes ??= [];
  await this.removeOldRecipes(recipes, state, service);
  await this.renewRecipes(recipes, state, service);
},

async removeOldRecipes(recipes, state, service) {
  return Promise.all(values(state.recipes).map(async recipe => {
    if (!this.findRecipe(recipe.$meta.name, recipes)) {
      return this.removeRecipe(recipe, state, service);
    }
  }));
},

async removeRecipe(recipe, state, service) {
  await this.stopRecipe(recipe, state, service);
  await this.removeStores(recipe, state, service);
},

findRecipe(recipeName, recipes) {
  return recipes.find(({$meta: {name}}) => recipeName === name);
},

async stopRecipe(recipe, state, service) {
  delete state.recipes[recipe.$meta.name];
  return service({msg: 'FinagleRecipe', data: {recipe, value: false}});
},

async removeStores({$stores}, state, service) {
  return Promise.all(entries($stores || {}).map(async ([storeId, store]) => {
    if (!store.connection) {
      delete state.stores[storeId];
      await service({msg: 'RemoveStore', data: {storeId}});
    }
  }));
},

async renewRecipes(recipes, state, service) {
  for (const recipe of recipes) {
    const runningRecipe = state.recipes[recipe.$meta.name];
    if (runningRecipe) {
      const updatedParticles = this.findParticlesWithChangedConnections(recipe, runningRecipe);
      updatedParticles.forEach(particleId => {
        service({msg: 'UpdateConnections', data: {particleId, spec: recipe[particleId]}});
        state.recipes[recipe.$meta.name] = recipe;
      });
    } else {
      await this.startRecipe(recipe, state, service);
    }
  }
},

omitConnectionStores(recipe, state) {
  entries(recipe.$stores || {}).forEach(([storeId, store]) => {
    if (store.connection && state.stores[storeId]) {
      delete recipe.$stores[storeId];
    } else {
      state.stores[storeId] = store;
    }
  });
  return recipe;
},

async startRecipe(recipe, state, service) {
  state.recipes[recipe.$meta.name] = recipe;
  return service({msg: 'FinagleRecipe', data: {
    recipe: this.omitConnectionStores(recipe, state),
    value: true
  }});
},

findParticlesWithChangedConnections(recipe, runningRecipe) {
  const particleNames = this.getParticleNames(recipe);
  return particleNames.filter(particleName => {
    return JSON.stringify(recipe[particleName].$inputs)
      !== JSON.stringify(runningRecipe[particleName].$inputs);
  });
},

getParticleNames(recipe) {
  const notKeyword = name => !name.startsWith('$');
  return recipe && keys(recipe).filter(notKeyword);
},

render({pipeline, selectedNode, nodeTypes, categories}, {recipes}) {
  const idsForNode = (node) =>
      (node && !this.isUIHidden(node) &&
        this.getParticleNamesForNode(node, pipeline, recipes)) ||
      [];
  const rects = pipeline?.nodes?.map(
    node => idsForNode(node).map(id => ({id, position: node.position?.preview?.[id]}))).flat();
  const nodeType =
      nodeTypes?.find(({$meta: {name}}) => selectedNode?.name === name);
  return {
    selectedKeys: idsForNode(selectedNode),
    rects,
    color: this.colorByCategory(nodeType?.$meta?.category, categories),
  };
},

isUIHidden(node) {
  return Boolean(node?.props?.hideUI);
},

onNodeDelete({eventlet: {key}, pipeline}, {recipes}) {
  const node = this.findNodeByParticle(key, pipeline, recipes);
  pipeline.nodes = pipeline.nodes.filter(n => n.key !== node.key);
  return {pipeline, selectedNode: null};
},

onNodePosition({eventlet: {key, value}, pipeline}, {recipes}) {
  const node = this.findNodeByParticle(key, pipeline, recipes);
  if (node) {
    const selectedNode = {...node, position: {...node.position, preview: {...node.position?.preview, [key]: value}}};
    return {
      selectedNode,
      pipeline: this.updateNodeInPipeline(selectedNode, pipeline)
    };
  } else {
    return {
      selectedNode: null
    };
  }
},

findNodeByParticle(particleName, pipeline, recipes) {
  return pipeline.nodes.find(node => {
    const names = this.getParticleNamesForNode(node, pipeline, recipes);
    return names?.find(name => name === particleName);
  });
},

getParticleNamesForNode(node, pipeline, recipes) {
  const fullNodeKey = this.encodeFullNodeKey(node, pipeline);
  return this.getParticleNames(recipes[fullNodeKey]);
},

encodeFullNodeKey({key}, {$meta}) {
  return [$meta?.name, key].filter(Boolean).join(this.runnerDelimiter);
},

updateNodeInPipeline(node, pipeline) {
  const index = pipeline.nodes.findIndex(n => n.key === node.key);
  pipeline.nodes = assign([], pipeline.nodes, {[index]: node});
  return pipeline;
},

colorByCategory(category, categories) {
  return categories?.[category]?.color || 'lightblue';
},

template: html`
<style>
:host {
  color: black;
  background-color: var(--theme-color-bg-1);
  min-height: 120px;
  border-bottom: 1px solid silver;
}
[frame="runner"] > * {
  flex: none !important;
}
</style>
<div bar frame="chooser"></div>
<container-layout flex scrolling column frame="runner"
                  on-position="onNodePosition"
                  on-delete="onNodeDelete"
                  selected="{{selectedKeys}}"
                  rects="{{rects}}"
                  color="{{color}}"
                  hidebox="{{hideBox}}">
</container-layout>
`
});
