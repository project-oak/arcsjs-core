/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
// import {App} from '../../Library/App/App.js';
import {App} from '../Library/App/Worker/App.js';
// import {LocalStoragePersistor} from '../../Library/App/storage.js';
import {logFactory} from '../Library/Core/utils.min.js';
import {NodegraphRecipe} from './Library/NodegraphRecipe.js';
// import {GoogleApisService} from '../../Library/nostalgic/Goog/GoogleApisService.js';

const log = logFactory(true, 'Nodegraph', 'navy');

// App class
export const NodegraphApp = class extends App {
  constructor(paths) {
    super(paths);
    // this.persistor = LocalStoragePersistor;
    this.services = []; // [RecipeService, StoreService, DevToolsService, AdaptedServices];
    this.userAssembly = [NodegraphRecipe];
    log('Welcome to Nodegraph!');
  }
};
