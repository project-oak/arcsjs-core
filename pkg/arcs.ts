/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export * from './js/Runtime.js';
export * from './js/core/EventEmitter.js';
export * from './js/core/Store.js';
export * from './js/core/Arc.js';
export * from './js/core/Host.js';
export * from './js/core/Decorator.js';
export * from './js/recipe/Chef.js';
export * from './js/recipe/RecipeParser.js';
export * from './js/render/Composer.js';
export * from './js/render/Surface.js';
export * from './js/isolation/code.js';
export * from './js/isolation/ses.js';

import * as utils from './js/utils/utils.js';
const {logFactory, Paths} = utils;
export {logFactory, Paths, utils};

const root = import.meta.url.split('/').slice(0, -1).join('/');
Paths.setRoot(root);
