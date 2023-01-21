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
  // Main thread things
  'Core/utils.js',
  'App/Worker/App.js',
  'App/Resources.js',
  'App/Params.js',
  'App/HistoryService.js',
  'App/boot.js',
  'LocalStorage/LocalStoragePersistor.js',
  'Mediapipe/PoseServiceLoader.js',
  // DOM things
  // 'Dom/Xen/xen-async.js',
  // 'Dom/dom.js',
  'App/common-dom.js',
  'Node/Dom/designer-layout.js',
  'Node/Dom/selector-panel.js',
  'Node/Dom/node-graph.js',
  // Raw Power
  'PixiJs/pixi-view.js',
  'TensorFlow/TensorFlow.js'
]);
