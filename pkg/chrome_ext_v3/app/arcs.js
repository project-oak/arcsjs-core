/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// use Library path from configuration

const Library = globalThis.config.arcsPath;

// import modules from the ArcsJs Library
// the 'load' function imports modules in parallel

const load = async paths => (await Promise.all(paths.map(p => import(`${Library}/${p}`)))).reduce((e, m) =>({...e, ...m}),{});

export const {
  Paths, logFactory, App, Resources, Params,
  deepQuerySelector, Xen,
  quickStart,
  LocalStoragePersistor, HistoryService,
  NodeCatalogRecipe,
  MediaService,
  MediapipeNodes,
  FaceMeshService, SelfieSegmentationService,
  ThreejsService, ShaderService,
  TensorFlowService, CocoSsdService,
  LobbyService,
  GoogleApisService,
  // must be last
  ...etc
} = await load([
  'Core/utils.js',
  'Isolation/vanilla.js',
  'App/TopLevel/App.js',
  'App/Resources.js',
  'App/Params.js',
  'App/HistoryService.js',
  'App/boot.js',
  'App/common-dom.js',
  'Dom/Xen/xen-async.js',
  'Dom/dom.js',
  'Dom/multi-select.js',
  'Dom/code-mirror/code-mirror.js',
  'LocalStorage/LocalStoragePersistor.js',
  'Designer/designer-layout.js',
  'NodeGraph/dom/node-graph.js',
  'NodeTypeCatalog/draggable-item.js',
  'NodeTypeCatalog/NodeCatalogRecipe.js',
  'Rtc/LobbyService.js',
  'Goog/GoogleApisService.js',
  'NewMedia/Nodes/Camera.js',
  'NewMedia/MediaService.js',
  'Mediapipe/FaceMeshService.js',
  'Mediapipe/SelfieSegmentationService.js',
  'Mediapipe/MediapipeNodes.js',
  'Threejs/ThreejsService.js',
  'Shader/ShaderService.js',
  'Shader/ShaderNodes.js',
  'TensorFlow/TensorFlow.js',
  'TensorFlow/TensorFlowService.js',
  'TensorFlow/CocoSsdService.js',
  'TensorFlow/CocoSsdNode.js',
  'Display/DisplayNodes.js'
]);

// // memoize important paths

// const url = Paths.getAbsoluteHereUrl(import.meta, 1);

// // important paths
// Paths.add({
//   $app: `${url}/../deploy/nodegraph`,
//   $config: `${url}/config.js`,
//   $library:`${url}/../deploy/Library`
// });