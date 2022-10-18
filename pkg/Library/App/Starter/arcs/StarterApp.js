/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {App, logFactory, LocalStoragePersistor} from '../arcs.js';
import {SimpleRecipe} from '../Library/StarterRecipe.js';

const log = logFactory(true, 'SimpleApp', 'navy');

// App class
export const SimpleApp = class extends App {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.services = {};
    this.recipes = [SimpleRecipe];
    log('Welcome!');
  }
};
