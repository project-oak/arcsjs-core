/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
  async update({actionId, actionsDefault, actionsPrivate, actionsAggregate, device}, state, {service}) {
    if (actionId != state.lastActionId) {
      log('action changed for device', device);
      const actions = [...actionsDefault, ...actionsPrivate, ...actionsAggregate];
      await this.finagleAction(state.lastActionId, actions, device, false, service);
      state.lastActionId = actionId;
      await this.finagleAction(actionId, actions, device, true, service);
      return {classifierResults: null, transcript: null};
    }
  },
  async finagleAction(actionId, actions, device, finagle, service) {
    if (actionId) {
      const findAction = actions => actions.find(({meta}) => meta.id === actionId);
      const action = findAction(actions);
      const recipes = action?.recipes.filter(recipe => recipe.$meta.devices?.includes(device));
      log('found', recipes, 'for', action, 'on', device);
      return recipes?.map && Promise.all(recipes.map(async recipe => {
        await this.finagle(recipe, false, service);
        if (finagle) {
          await this.finagle(recipe, true, service);
        }
      }));
    }
  },
  async finagle(recipe, finagle, service) {
    return service({msg: 'FinagleRecipe', data: {recipe, value: finagle}});
  }
});
