/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
async update({actionId, actionsPrivate, actionsDefault, actionsAggregate, selectedHubModel, recipesPrivate, recipesDefault, selectedRecipe}, state, {service, output}) {
  state.recipes = (recipesPrivate ?? []).concat(recipesDefault ?? []);
  if (!state.uid) {
    const {uid} = await service({msg: 'LoggedInUser'});
    state.uid = uid;
  }
  if (state.selectedHubModel?.url !== selectedHubModel?.url) {
    state.selectedHubModel = selectedHubModel;
    this.updateSelectedHubModel({actionId, actionsPrivate, selectedHubModel}, state, {service});
  }
  if (state.actionId !== actionId) {
    this.updateActionId({actionId, actions: [...actionsPrivate, ...actionsDefault, ...actionsAggregate]}, state, {output});
    state.planning = this.renderPlanning({}, state);
  }
  if (state.wearableMode === undefined) {
    this.onWearableClick({}, state, {service});
  }
  if (!selectedRecipe) {
    state.showRecipeEdit = false;
  }
},
async updateSelectedHubModel({actionId, actionsPrivate, selectedHubModel}, state, {service}) {
  state.showModelChooser = false;
  if (selectedHubModel && actionId) {
    state.action = actionsPrivate?.find(a => a.meta.id === actionId);
    const recipe = state.action?.recipes?.find(({$meta}) => $meta.name === 'HubModel');
    await this.finagleRecipe(recipe, selectedHubModel, service);
  }
},
async finagleRecipe(recipe, model, service) {
  const $staticInputs = recipe?.Classifier?.$staticInputs;
  if ($staticInputs && $staticInputs.model?.url !== model.url) {
    $staticInputs.model = model;
    const finagle = async finagle => await service({msg: 'FinagleRecipe', data: {recipe, value: finagle}});
    // make sure we don't double up
    await finagle(false);
    // clear to land
    await finagle(true);
  }
},
async updateActionId({actionId, actions}, state, {output}) {
  state.showModelChooser = false;
  state.switches = create(null);
  if (actionId) {
    state.action = actions.find(({meta}) => meta.id === actionId);
    const {action, switches} = state;
    action?.recipes?.forEach(({$meta:{name}, Classifier}) => {
      switches[name] = true;
      if (name === 'HubModel') {
        output({selectedHubModel: {...Classifier?.$staticInputs?.model}});
      }
    });
  }
},
render({selectedHubModel}, {action, recipes, switches, showModelChooser, showRecipeEdit, uid, wearableMode, imagesEnabled, planning}) {
  if (action) {
    const groups = this.renderGroups({selectedHubModel}, {action, recipes, uid, switches, planning});
    return {
      ...groups,
      showModelChooser,
      showRecipeEdit,
      wearableLigature: wearableMode ? `devices_other` : `phonelink_off`,
      imageLigature: imagesEnabled ? `grid_on` : `grid_off`,
    };
  }
},
renderGroups({selectedHubModel}, {action, recipes, uid, switches, planning}) {
  const groups = {};
  const owned = action.meta.owner === uid;
  recipes.forEach(({$meta}) => {
    const groupName = `${$meta?.group || 'other'}_switches`;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    const checked = switches?.[$meta?.name];
    if (owned || checked) {
      const hasNeeds = Boolean(planning[$meta?.name]);
      const formatNeeds = (missing) => {
        const container = Object.keys(missing)[0];
        return missing[container]?.length > 0 ? `needs <b>${missing[container][0].recipe.description}</b>` : `missing <b>${container}</b>`;
      };
      groups[groupName].push({
        ...$meta,
        label: $meta?.description,
        needs: hasNeeds ? formatNeeds(planning[$meta?.name]) : '',
        hideSwitch: false, // hasNeeds,
        disabled: !owned, // || hasNeeds,
        notOwned: !owned,
        recipeNotOwned: $meta?.owner !== uid,
        modelName: ($meta?.name === 'HubModel' && selectedHubModel?.description) || '',
        hideSettings: $meta?.name !== 'HubModel',
        checked,
      });
    }
  });
  const hideGroups = {};
  ['other_switches', 'classifier_switches', 'meta_switches'].forEach(
    name => hideGroups[`${name}Empty`] = !(groups[name]?.length)
  );
  return {...groups, ...hideGroups};
},
renderWearableRecipes() {
  return ['VideoFeedRecipe'];
},
renderPlanning(inputs, {recipes, switches, wearableMode}) {
  const getParticles = (recipe) => Object.keys(recipe).filter(key => !key.startsWith('$')).map(key => recipe[key]);
  const providedSlots = {buildViewer: [{recipe: 'main', on: true}], tools: [{recipe: 'main', on: true}]};
  recipes.forEach(recipe => {
    getParticles(recipe).map(p => p.$slots && Object.keys(p.$slots)).flat().forEach(slot => {
      if (!providedSlots[slot]) {
        providedSlots[slot] = [];
      }
      const on = Boolean(switches[recipe.$meta?.name]) ||
                 (wearableMode && this.renderWearableRecipes().includes(recipe.$meta?.name));
      providedSlots[slot].push({recipe: recipe.$meta, on});
    });
  });
  const needsByRecipes = {};
  recipes.forEach(recipe => {
    // TODO(mariakleiner): verify container's hierarchy (atm only checking frame's name).
    const containers = getParticles(recipe).map(p => p.$container?.split('#')?.pop()).filter(c => !!c);
    const missing = {};
    containers.forEach(container => {
      if (!providedSlots[container]?.some(providedBy => Boolean(providedBy?.on))) {
        missing[container] = providedSlots[container];
      }
    });
    if (Object.keys(missing).length > 0) {
      needsByRecipes[recipe.$meta?.name] = missing;
    }
  });
  return needsByRecipes;
},
async onSwitchToggle({eventlet: {key, value}, actionsPrivate}, state, {service, output}) {
  const {action, switches, planning} = state;
  // record the new switch setting
  switches[key] = value;
  // use the event-key to find a recipe
  const recipe = state.recipes?.find(({$meta}) => $meta.name === key);
  // find the actionsPrivate record for current action
  const privateAction = actionsPrivate?.find(a => a.meta.id === action.meta.id);
  if (privateAction) {
    if (privateAction !== action) {
      log('action is not private');
    }
    await this.toggleRecipe(privateAction.recipes, recipe, value);
    output({actionsPrivate});
    // automatically turn on recipe's dependencies:
    if (value && planning[key]) {
      const recipeNeeds = planning[key];
      Object.keys(recipeNeeds).forEach(frame => {
        if (recipeNeeds[frame]?.length > 0) {
          const missing = recipeNeeds[frame].find(({recipe}) => !this.renderWearableRecipes().includes(recipe.name));
          if (missing) {
            this.onSwitchToggle({eventlet: {key: missing.recipe.name, value: true}}, state, {service, output});
          }
        }
      });
    }
  }
  await service({msg: 'FinagleRecipe', data: {recipe, value}});
  state.planning = this.renderPlanning({}, state);
},
async toggleRecipe(recipes, recipe, addOrRemove) {
  if (addOrRemove) {
    recipes.push(recipe);
  } else {
    const recipeIndex = recipes.findIndex(({$meta: {name}}) => name === recipe.$meta?.name);
    if (recipeIndex >= 0) {
      recipes.splice(recipeIndex, 1);
    }
  }
},
async onSettings(inputs, state) {
  state.showModelChooser = true;
},
async onCloseModelChooser(inputs, state) {
  state.showModelChooser = false;
},
async onForkRecipe({eventlet: {key}, recipesPrivate}, state, {service}) {
  const {uid, recipes} = state;
  const recipe = recipes.find(({$meta}) => $meta.name === key);
  const newRecipe = {
    ...recipe,
    $meta: {
      ...recipe.$meta,
      name: `${recipe.$meta?.name}-${(await service({msg: 'MakeName'}))}`,
      description: `Copy of ${recipe.$meta.description}`,
      owner: uid,
    }
  };
  recipesPrivate.push(newRecipe);
  state.recipes.push(newRecipe);
  return {recipesPrivate};
},
async onEditRecipe({eventlet: {key}}, state) {
  state.showRecipeEdit = true;
  return {selectedRecipe: key};
},
onDeleteRecipe({eventlet: {key}, recipesPrivate, actionsPrivate}, {action, switches}, tools) {
  if (switches[key]) {
    this.onSwitchToggle({eventlet: {key, value: false}, recipesPrivate, actionsPrivate}, {action, switches}, tools);
  }
  const index = recipesPrivate.findIndex(({$meta}) => $meta.name === key);
  recipesPrivate.splice(index, 1);
  return {recipesPrivate};
},
async onRecipeEditClick({eventlet: {key}}, state) {
  state.showRecipeEdit = (key === 'inside');
},
async onWearableClick(inputs, state, {service}) {
  state.wearableMode = !state.wearableMode;
  state.planning = this.renderPlanning({}, state);
  // dis/enable these three for 'wearableMode'
  return this.finagleRecipes(this.renderWearableRecipes(), state.wearableMode, state.recipes, service);
},
onImagesClick(inputs, state, {service}) {
  state.imagesEnabled = !state.imagesEnabled;
  // dis/enable these for 'imagesEnabled'
  return this.finagleRecipes(['StaticFeedRecipe'], state.imagesEnabled, state.recipes, service);
},
finagleRecipes(names, finagle, recipes, service) {
  return Promise.all(recipes.map(
    async recipe => {
      if (names.includes(recipe.$meta.name)) {
        return service({msg: 'FinagleRecipe', data: {recipe, value: finagle}});
      }
    })
  );
},
onSquelch() {
},
async onSelectDevice({eventlet: {key}}, state, {service}) {
  if (key) {
    await service({msg: 'request-surface', name: key});
  }
},
template: html`
<style>
  :host {
    display: flex;
    padding-top: 0px;
    font-size: 11px;
    font-weight: bold;
    background-color: var(--theme-color-5);
    --mise-cell-bg: var(--theme-color-0);
    --mise-cell-fg: var(--theme-color-7);
    --mise-cell-bg-2: var(--theme-color-5);
    --mise-cell-fg-2: var(--theme-color-2);
    --mise-highlight: var(--theme-color-9);
    --mdc-theme-on-surface: var(--mise-cell-fg-2);
  }
  [cell] {
    padding: 6px;
  }
  h2, h2[cell] {
    background: var(--mise-cell-fg-2);
    color: var(--mise-cell-bg-2);
    border-width: 0;
    font-size: 11px;
    margin: 4px 5px 4px 0;
    padding: 2px 6px;
    text-align: center;
  }
  [switches]  {
    display: flex;
    flex-direction: column;
    border: 1px dotted var(--mise-cell-fg-2);
    margin-bottom: 12px;
  }
  [switchbox] {
    padding: 3px 4px;
  }
  [switch] {
    height: 24px;
    width: 84px;
  }
  [label] {
    font-size: 0.9em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 164px;
    max-width: 164px;
  }
  [pad] {
    padding: 0 0 0 8px;
  }
  [section] {
    padding: 12px 8px 10px;
  }
  hr {
    border-color: var(--mise-highlight);
  }
  [scrolling] {
    overflow: scroll;
  }
  [disabled] {
    pointer-events: none;
  }
  [needs] {
    overflow: visible !important;
    font-size: 0.8em;
    font-style: italic;
    color: var(--mise-highlight);
  }
  [controls] {
    width: 384px;
  }
  [frame="buildViewer"] {
    border: 1px solid var(--theme-color-bg-1);
    position: relative;
  }
  [grid] {
    margin-top: 16px;
  }
  [frame="modelChooser"] {
    padding: 10% max(64px, 15%);
    box-shadow: rgba(17, 17, 26, 0.1) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 48px;
    border-radius: 12px;
  }
  [modelName] {
    font-size: 0.7em;
    color: var(--theme-color-9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 2px 4px 2px 0;
  }
  icon {
    font-size: 16px;
  }
  [defaultAction] {
    zoom: 0.5;
    border-radius: 50%;
    background: var(--theme-color-8);
    height: 48px;
    width: 48px;
    margin: 3px;
  }
  [defaultAction] > img {
    height: 42px;
    width: 42px;
    border-radius: 50%;
    cursor: pointer;
  }
  [scrub][toolbar] {
    align-self: self-start;
    font-size: 24px;
    background-color: var(--theme-color-6);
    border-radius: 32px;
    padding-left: 12px;
    margin: 8px;
  }
  [frame="recipeEdit"] {
    width: 80%;
    height: 80%;
  }
  [devices] {
    flex: 1;
    background-color: var(--theme-color-6);
    max-height: 150px;
    margin-top: 0px;
  }
</style>

<div scrub toolbar>
  <icon on-click="onWearableClick">{{wearableLigature}}</icon>
  <icon on-click="onImagesClick">{{imageLigature}}</icon>
</div>

<div flex columns>
  <div rows>
    <div flex dark scrolling controls>
      <div pad>
        <h2 cell hidden="{{classifier_switchesEmpty}}">Perception</h2>
        <div repeat="switch_t">{{classifier_switches}}</div>
        <!-- -->
        <h2 cell hidden="{{meta_switchesEmpty}}">Metadata</h2>
        <div repeat="switch_t">{{meta_switches}}</div>
        <!-- -->
        <h2 cell>Displays</h2>
        <div repeat="switch_t">{{basic_switches}}</div>
        <div repeat="switch_t">{{vertical_switches}}</div>
        <!-- -->
        <h2 cell hidden="{{other_switchesEmpty}}">Other</h2>
        <div repeat="switch_t">{{other_switches}}</div>
        </div>
    </div>
  </div>
  <!-- -->
  <div flex rows>
    <div flex rows stage>
      <div devices grid frame="devices"></div>
      <div flex rows frame="buildViewer"></div>
    </div>
    <div frame="tools"></div>
  </div>
</div>

<modal-view show="{{showModelChooser}}" on-click="onCloseModelChooser">
  <div flex rows frame="modelChooser"></div>
</modal-view>

<modal-view show="{{showRecipeEdit}}" on-click="onRecipeEditClick">
  <div frame="recipeEdit"></div>
</modal-view>

<template switch_t>
  <div switchbox bar>
    <div label>{{description}}</div>
    <div switch center noclip rows>
      <mwc-switch disabled="{{disabled}}" key="{{name}}" hidden="{{hideSwitch}}" checked="{{checked}}" on-change="onSwitchToggle"></mwc-switch>
    </div>
    <!-- <div needs flex unsafe-html="{{needs}}"></div> -->
    <div flex modelName>{{modelName}}</div>
    <icon hidden="{{hideSettings}}" key="{{switch}}" on-click="onSettings">settings</icon>
    <icon hidden="{{notOwned}}" key="{{name}}" on-click="onForkRecipe">restaurant</icon>
    <icon hidden="{{recipeNotOwned}}" key="{{name}}" on-click="onEditRecipe">edit</icon>
    <icon hidden="{{recipeNotOwned}}" key="{{name}}" on-click="onDeleteRecipe">delete</icon>
  </div>
</template>
`
});
