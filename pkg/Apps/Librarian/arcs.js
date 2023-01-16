/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

// N.B. executing inside worker boundary

// configure
import './config.js';
// import arcs engine
import '../Library/App/Worker/ArcsWorker.js';

// // import arcsjs-core dependency
// import '../arcsjs-core.js';
// // // import isolation technology
// // import '../../env/arcsjs-core/js/isolation/ses.js';
// // export support systems
// export * from '../arcsjs-support.js';
// // use tools
// import {Paths, importModules} from '../arcsjs-support.js';

// // DOM related
// export const {
//  loadCss,
//  Resources,
//  XenSurface: Surface,
//  subscribeToStream
// } = await importModules(async path => import(path), [
//  '$library/App/Resources.js',
//  '$library/Dom/dom.js',
//  '$library/Dom/surfaces/xen/xen-surface.js',
//  '$library/Dom/material-xen/material-xen.js',
//  '$library/Dom/mwc/mwc.min.js',
//  '$library/Dom/arcs-elements/arcs-elements.js',
//  '$library/Dom/data-explorer/data-explorer.js',
//  '$library/Dom/surfaces/xen/surface-walker.js',
//  '$library/Dom/code-mirror/code-mirror.js',
//  '$library/DevTools/resource-view.js',
//  '$library/Media/image-resource.js',
//  '$library/Media/media-stream/media-stream.js',
//  '$library/Media/media-stream/video-view.js',
// ]);

// // material icon font
// await loadCss(Paths.resolve('$library/Dom/material-icon-font/icons.css'));

// // general purpose
// export const {
//   App,
//   LocalStoragePersistor,
//   DevToolsRecipe,
//   DevToolsService,
//   DeviceUxNode,
//   //RecipeService,
//   //StoreUpdateService,
// } = await importModules(async path => import(path), [
//   '$library/App/App.js',
//   '$library/App/storage.js',
//   '$library/DevTools/DevToolsRecipe.js',
//   '$library/DevTools/DevToolsService.js',
//   '$library/Media/DeviceUxNodes.js',
//   //'$library/App/RecipeService.js',
//   //'$library/NodeGraph/StoreUpdateService.js'
// ]);

// export const DevTools = {DevToolsRecipe, DevToolsService};
