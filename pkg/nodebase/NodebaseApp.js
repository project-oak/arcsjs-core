/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App} from '../Library/App/Worker/App.js';
import {RecipeService} from '../Library/Arcs/RecipeService.js';
import {StoreUpdateService} from '../Library/Arcs/StoreUpdateService.js';
import {NodebaseRecipe} from './Library/NodebaseRecipe.js';
import {LocalStoragePersistor} from '../Library/LocalStorage/LocalStoragePersistor.js';
// import {FissionPersistor} from '../Library/Fission/FissionPersistor.js';
import {logFactory} from '../core/utils.min.js';
import '../Library/App/surface-imports.js';

const log = logFactory(true, 'LobbyApp', 'navy');

//App.Paths.add({$here: App.Paths.getAbsoluteHereUrl(import.meta)});

// App class
export const NodebaseApp = class extends App {
  constructor(paths) {
    super(paths);
    //this.persistor = FissionPersistor;
    this.services = [RecipeService, StoreUpdateService];
    this.userAssembly = [NodebaseRecipe];
  }
};
