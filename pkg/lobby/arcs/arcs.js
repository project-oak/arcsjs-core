/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// use dynamic dependencies (for versioning and debugging)

const Library = globalThis.config.library;

// import the Arcs stuff we want to use ...
// combining the exports lets us load the files in parallel

const load = async paths => (await Promise.all(paths.map(p => import(p)))).reduce((e, m) =>({...e, ...m}),{});

export const {

  Paths, logFactory, App, Resources, Params,
  Xen, LocalStoragePersistor, LobbyService,
  deepQuerySelector, ...etc

} = await load([

  `${Library}/Core/utils.js`,
  `${Library}/App/Worker/App.js`,
  `${Library}/App/Resources.js`,
  `${Library}/App/Params.js`,
  `${Library}/App/surface-imports.js`,
  `${Library}/Dom/Xen/xen-async.js`,
  `${Library}/Dom/dom.js`,
  `${Library}/LocalStorage/LocalStoragePersistor.js`,
  `${Library}/Rtc/LobbyService.js`

]);

// memoize important paths

const url = Paths.getAbsoluteHereUrl(import.meta, 1);

Paths.add({
  $app: url,
  $config: `${url}/config.js`,
  $library: Library
});