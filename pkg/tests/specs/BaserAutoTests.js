/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {AppClass} from './BaserEnv.js';
import {waitFor, checkState, getTestState} from '../lib/test-utils.js';

const {workbench} = window;

const name = 'auto_captured_state';
//const state = getTestState(name);

export const auto_captured_state = async() => {
//export const Baser_startup_state = async () => {
  const App = window.App = new AppClass();
  // `App` gets `workbench` for surfaces
  await App.spinup(workbench);
  // race a while
  //await waitFor(5000);
  // get the latest expected state
  const state = await getTestState(name);
  // check state against database
  return checkState(state);
};
