/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {App, makeName/*, RecipeService, StoreUpdateService*/} from './allowlist.js';
//import {App, LocalStoragePersistor, themeRules, RecipeService, StoreUpdateService, DevToolsService} from './conf/support.js';
import {StudioRecipe} from './Library/StudioRecipe.js';

// App class
export const StudioApp = class extends App {
  constructor(paths, root, options) {
    super(paths, root);
    //this.persistor = LocalStoragePersistor;
    //this.services = [RecipeService, StoreUpdateService];
    this.userAssembly = [StudioRecipe];
  }
  onservice(user, host, request) {
    switch (request.msg) {
      case 'MakeName':
        return makeName();
    }
  }
};
