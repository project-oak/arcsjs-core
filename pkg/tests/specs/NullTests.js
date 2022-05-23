/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Arc, Store} from '../../arcs-import.js';
import {waitFor, checkState, getTestState, getTestInjections} from '../lib/test-utils.js';

const AppClass = class {
  async spinup() {
   this.arc = new Arc('arc');
  }
  get state() {
    return '{}';
  }
};

export const nullStartupState = async () => {
  const App = window.App = new AppClass();
  await App.spinup();
  return checkState(App.state, '{}');
};
