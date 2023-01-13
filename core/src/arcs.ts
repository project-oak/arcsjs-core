/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export * from '../js/Runtime.js';
export * from '../js/core/EventEmitter.js';
export * from '../js/core/Store.js';
export * from '../js/core/Arc.js';
export * from '../js/core/Host.js';
export * from '../js/core/Decorator.js';
export * from '../js/recipe/Chef.js';
export * from '../js/recipe/Graphinator.js';
export * from '../js/recipe/ParticleCook.js';
export * from '../js/recipe/StoreCook.js';
export * from '../js/recipe/RecipeParser.js';
export * as code from '../js/isolation/code.js';

import * as utils from '../js/utils/utils.js';
const {logFactory, Paths} = utils;
export {logFactory, Paths, utils};

const root = import.meta.url.split('/').slice(0, -1).join('/');
Paths.setRoot(root);
