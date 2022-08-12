/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {NodegraphApp} from '../../nodegraph/Library/NodegraphApp.js';
import {waitFor, checkState, getTestState} from '../lib/test-utils.js';

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

const {workbench} = window;
const name = 'auto_captured_state';

export const Noder_auto_captured_state = async() => {
//export const Baser_startup_state = async () => {
  const App = window.App = new AppClass();
  // `App` gets `workbench` for surfaces
  await App.spinup(workbench);
  // check state against database
  return checkState(await getTestState(name));
};
