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

export const load = async paths => (await Promise.all(paths.map(p => import(`${Library}/${p}`)))).reduce((e, m) =>({...e, ...m}),{});

export const {
  Paths, logFactory, App, Resources, Params, quickStart,
  deepQuerySelector, Xen,
  LocalStoragePersistor,
  // must be last
  ...etc
} = await load([
  'Core/utils.js',
  'App/Worker/App.js',
  'App/common-dom.js',
  'App/boot.js',
  'App/Resources.js',
  'App/Params.js',
  'App/HistoryService.js',
  'Dom/Xen/xen-async.js',
  'Dom/dom.js',
  'LocalStorage/LocalStoragePersistor.js',
  'Designer/designer-layout.js',
  'NodeGraph/Dom/node-graph.js',
  'PixiJs/pixi-view.js',
  'TensorFlow/TensorFlow.js'
]);
