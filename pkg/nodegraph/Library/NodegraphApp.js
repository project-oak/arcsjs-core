/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App} from '../../Library/App/App.js';
import {LocalStoragePersistor} from '../../Library/App/storage.js';
import {RecipeService} from '../../Library/App/RecipeService.js';
import {StoreService} from '../../Library/NodeGraph/StoreService.js';
import {DevToolsService} from '../../Library/DevTools/DevToolsService.js';
import {themeRules} from '../../Library/App/theme.js';
import {NodegraphRecipe} from './NodegraphRecipe.js';
import {GoogleApisService} from '../../Library/nostalgic/Goog/GoogleApisService.js';

// these are servicelets and need adaptation
const serviceMap = {
  GoogleApisService,
};
const AdaptedServices = async (runtime, host, request) => {
  return (serviceMap[request.kind])?.receive(request);
};

// App class
export const NodegraphApp = class extends App {
  constructor() {
    super({themeRules});
    this.persistor = LocalStoragePersistor;
    this.services = [RecipeService, StoreService, DevToolsService, AdaptedServices];
    this.userAssembly = [NodegraphRecipe];
  }
};
