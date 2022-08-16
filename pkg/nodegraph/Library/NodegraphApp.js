/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {App} from '../../Library/App/App.js';
import {LocalStoragePersistor} from '../../Library/App/storage.js';
import {RecipeService} from '../../Library/App/RecipeService.js';
import {StoreUpdateService} from '../../Library/NodeGraph/StoreUpdateService.js';
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
    this.services = [RecipeService, StoreUpdateService, DevToolsService, AdaptedServices];
    this.userAssembly = [NodegraphRecipe];
  }
};
