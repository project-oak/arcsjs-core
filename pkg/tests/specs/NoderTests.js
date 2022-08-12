/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {NodegraphApp} from '../../nodegraph/Library/NodegraphApp.js';
import {waitFor, checkState, getTestState, getTestInjections} from '../lib/test-utils.js';

const {workbench} = window;

// AppClass extension lets us tweak setup for testing
const AppClass = class extends NodegraphApp {
  constructor() {
    super();
    this.surfaceRoot = workbench;
    // Paths.add({
    //   $app: '../'
    // });
  }
};

export const Noder_startup_state = async () => {
  const App = window.App = new AppClass();
  // `App` gets `workbench` for surfaces
  await App.spinup(workbench);
  // race a while
  //await waitFor(500);
  // get the latest expected state
  const state = await getTestState('Noder_startup_state');
  // check state against database
  return checkState(state);
};

export const Noder_injected_state = async () => {
  const name = 'Noder_injected_state';
  // get detailed configurations
  const state = await getTestState('Noder_injected_state');
  const injections = await getTestInjections(name);
  //
  const App = window.App = new AppClass();
  // `App` gets `workbench` for surfaces
  await App.spinup(workbench);
  // race a while
  await waitFor(500);
  //
  // inject!
  const {stores} = App.user;
  for (const key in injections) {
    console.log(key, injections[key]);
    stores[key].data = JSON.parse(injections[key]);
  }
  //
  // check state against database
  return checkState(state);
};
