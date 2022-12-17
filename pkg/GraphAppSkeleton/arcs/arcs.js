/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// use Library path from configuration

const Library = `${globalThis.config.arcsPath}/Library`;

// import modules from the ArcsJs Library
// the 'load' function imports modules in parallel

const load = async paths => (await Promise.all(paths.map(p => import(`${Library}/${p}`)))).reduce((e, m) =>({...e, ...m}),{});

export const {
  Paths,
  logFactory,
  App,
  RecipeBuilder,
  Resources,
  Params,
  Xen,
  deepQuerySelector,
  quickStart,
  LocalStoragePersistor,
  // must be last
  ...etc
} = await load([
  // Main thread things
  'Core/utils.js',
  'Graphs/RecipeBuilder.js',
  'App/Worker/App.js',
  'App/Resources.js',
  'App/Params.js',
  'App/HistoryService.js',
  'App/boot.js',
  'LocalStorage/LocalStoragePersistor.js',
  // DOM things
  'App/common-dom.js',
  'Designer/designer-layout.js',
  // Raw Power
  'TensorFlow/TensorFlow.js',
  'PixiJs/pixi-view.js'
]);
