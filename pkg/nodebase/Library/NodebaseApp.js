/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
// main library
import {App} from '../../Library/App/Worker/App.js';
import {HistoryService} from '../../Library/App/HistoryService.js';
import {LocalStoragePersistor} from '../../Library/LocalStorage/LocalStoragePersistor.js';
// import {FissionPersistor} from '../Library/Fission/FissionPersistor.js';
import {logFactory} from '../../Library/Core/utils.min.js';
// local library
import {NodebaseRecipe} from './NodebaseRecipe.js';

const log = logFactory(true, 'Nodebase', 'navy');

//App.Paths.add({$here: App.Paths.getAbsoluteHereUrl(import.meta)});

// App class
export const NodebaseApp = class extends App {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.userAssembly = [NodebaseRecipe];
    this.services = {HistoryService};
    log('Welcome to Nodebase!');
  }
};
