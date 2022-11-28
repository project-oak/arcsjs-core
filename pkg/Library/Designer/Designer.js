/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
idDelimiter: '$$',

async initialize(inputs, state) {
  state.recipes = {};
  state.stores = {};
},

async update({recipes, selectedNodeId, layout}, state, {service}) {
  // reset selection state
  state.selectedNodeId = selectedNodeId;
  // reset layout state
  state.layout = layout;
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
  return service({kind: 'RecipeService', msg: 'FinagleRecipe', data: {recipe, value: false}});
},

async removeStores({$stores}, state, service) {
  return Promise.all(entries($stores || {}).map(async ([storeId, store]) => {
    if (!store.connection) {
      delete state.stores[storeId];
      await service({kind: 'StoreService', msg: 'RemoveStore', data: {storeId}});
    }
  }));
},

async renewRecipes(recipes, state, service) {
  for (const recipe of recipes) {
    const runningRecipe = state.recipes[recipe.$meta.name];
    if (!runningRecipe || runningRecipe.$meta.custom) {
      if (runningRecipe && !deepEqual(runningRecipe, recipe)) {
        await this.stopRecipe(recipe, state, service);
      }
      await this.startRecipe(recipe, state, service);
    } else {
      await this.updateConnections(recipe, runningRecipe, state, service);
      await this.updateContainers(recipe, runningRecipe, state, service);
    }
  }
},

async updateConnections(recipe, runningRecipe, state, service) {
  const particles = this.findParticlesWithChangedConnections(recipe, runningRecipe);
  particles.forEach(particleId => {
    service({kind: 'RecipeService', msg: 'UpdateConnections', data: {particleId, spec: recipe[particleId]}});
    state.recipes[recipe.$meta.name] = recipe;
  });
},

async updateContainers(recipe, runningRecipe, state, service) {
  const hostIds = this.findParticlesWithChangedContainer(recipe, runningRecipe);
  if (hostIds.length > 0) {
    const container = recipe[hostIds[0]].$container;
    await service({kind: 'ComposerService', msg: 'setContainer', data: {hostIds, container}});
    state.recipes[recipe.$meta.name] = recipe;
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
  return service({kind: 'RecipeService', msg: 'FinagleRecipe', data: {
    recipe: this.omitConnectionStores(recipe, state),
    value: true
  }});
},

findParticlesWithChangedConnections(recipe, runningRecipe) {
  const particleNames = this.getParticleNames(recipe);
  return particleNames.filter(particleName => {
    return JSON.stringify(recipe[particleName].$inputs) !== JSON.stringify(runningRecipe[particleName].$inputs);
  });
},

findParticlesWithChangedContainer(recipe, runningRecipe) {
  const particleNames = this.getParticleNames(recipe);
  return particleNames.filter(particleName => {
    return recipe[particleName].$container !== runningRecipe[particleName].$container;
  });
},

getParticleNames(recipe) {
  const notKeyword = name => !name.startsWith('$');
  return recipe && keys(recipe).filter(notKeyword);
},

render({graph, nodeTypes, categories}, {selectedNodeId, recipes, layout}) {
  const node = graph?.nodes?.[selectedNodeId];
  const nodeType = nodeTypes?.[node?.type];
  const ids = this.particleIdsForNode(node, graph, recipes);
  const rects = this.getRects(graph, recipes, layout);
  return {
    rects,
    selectedKeys: ids,
    color: this.colorByCategory(nodeType?.$meta?.category, categories),
  };
},

particleIdsForNode(node, graph, recipes) {
  return node
    && !this.isUIHidden(node)
    && this.getParticleNamesForNode(node, graph, recipes)
    || []
    ;
},

getParticleNamesForNode(node, graph, recipes) {
  if (graph) {
    const recipe = recipes[this.encodeFullNodeId(node, graph)];
    return this.getParticleNames(recipe);
  }
},

getRects(graph, recipes, layout) {
  const rectMap = (id, node) => ({id, position: layout?.[node.id]});
  const nodeMap = node => this.particleIdsForNode(node, graph, recipes).map(id => rectMap(id, node));
  return values(graph?.nodes).map(nodeMap).flat();
},

isUIHidden(node) {
  return Boolean(node?.props?.hideUI);
},

onNodeDelete({eventlet: {key}, graph}, state) {
  const node = this.findNodeByParticle(key, graph, state.recipes);
  delete graph.nodes[node.id];
  return {
    graph,
    ...this.selectNode(null, state)
  };
},

onNodePosition({eventlet: {key, value}, graph, layout}, state) {
  const node = this.findNodeByParticle(key, graph, state.recipes);
  if (!node) {
    return this.selectNode(null, state);
  }
  //console.log('caching layout rect', node.id, value);
  layout = state.layout = {...layout, [node.id]: value};
  return {
    layout,
    ...this.selectNode(node.id, state)
  };
},

selectNode(id, state) {
  state.selectedNodeId = id;
  return {
    selectedNodeId: id
  };
},

findNodeByParticle(particleName, graph, recipes) {
  return values(graph.nodes).find(node => {
    const names = this.getParticleNamesForNode(node, graph, recipes);
    return names?.find(name => name === particleName);
  });
},

encodeFullNodeId({id}, {$meta}) {
  return [$meta?.id, id].filter(Boolean).join(this.idDelimiter);
},

colorByCategory(category, categories) {
  return categories?.[category]?.color || 'lightblue';
},

onDrop({eventlet: {value: {id: type, position}}, graph, newNodeInfos}) {
  if (graph) {
    return {
      newNodeInfos: [...(newNodeInfos || []), {
        type,
        // Note: `previewLayout` shouldn't be hardcoded
        previewLayout: position
      }]
    };
  }
},

template: html`
<style>
  :host {
    color: var(--theme-color-fg-1);
    background-color: var(--theme-color-bg-1);
    min-height: 120px;
  }
  designer-layout {
    height: auto !important;
  }
</style>
<div bar frame="chooser"></div>
<drop-target flex row on-target-drop="onDrop">
  <designer-layout flex scrolling column
                    frame="graph"
                    on-position="onNodePosition"
                    on-delete="onNodeDelete"
                    selected="{{selectedKeys}}"
                    rects="{{rects}}"
                    color="{{color}}"
                    hidebox="{{hideBox}}">
  </designer-layout>
</drop-target>
`
});
