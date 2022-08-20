/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {App, makeName} from './conf/allowlist.js';
import {StudioRecipe} from './Library/StudioRecipe.js';

export const StudioApp = class extends App {
  constructor(paths, root, options) {
    super(paths, root);
    this.recipes = [StudioRecipe];
  }
  onservice(user, host, request) {
    switch (request.msg) {
      case 'MakeName':
        return makeName();
    }
  }
};
