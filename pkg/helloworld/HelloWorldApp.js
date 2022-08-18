/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
// import {App, LocalStoragePersistor, themeRules} from './conf/support.js';
import {App} from '../Library/App/Worker/App.js';
import {logFactory} from '../core/utils.min.js';
import {HelloWorldRecipe} from './HelloWorldRecipe.js';

const log = logFactory(true, 'LibrarianApp', 'navy');

// App class
export const HelloWorldApp = class extends App {
  constructor(path, root, options) {
    super(path, root, options);  // themeRules?
    // this.persistor = LocalStoragePersistor;
    this.services = [];
    this.userAssembly = [HelloWorldRecipe];
    log('HelloWorld lives!');
  }
};
