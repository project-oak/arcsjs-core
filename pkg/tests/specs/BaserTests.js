/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {AppClass} from './BaserEnv.js';
import {checkState, getTestState} from '../lib/test-utils.js';

const {workbench} = window;

export const Baser_startup_state = async () => {
  const App = window.App = new AppClass();
  // `App` gets `workbench` for surfaces
  await App.spinup(workbench);
  // race a while
  //await waitFor(5000);
  // get the latest expected state
  const state = await getTestState('Baser_startup_state');
  // check state against database
  return checkState(state);
};
