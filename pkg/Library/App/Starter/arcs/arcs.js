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
  Paths, logFactory,
  App, Resources, Params,
  Xen, deepQuerySelector,
  LocalStoragePersistor,
  turnkey,
  // LobbyService, HistoryService, MediaService,
  // FaceMeshService, SelfieSegmentationService,
  // MediapipeNodes,
  // ThreejsService, ShaderService,
  // CocoSsdService,
  // NodeCatalogRecipe,
  // must be last
  ...etc
} = await load([
  'Core/utils.js',
  'App/Worker/App.js',
  'App/Resources.js',
  'App/Params.js',
  'App/common-dom.js',
  'App/turnkey.js',
  'LocalStorage/LocalStoragePersistor.js',
  // 'App/HistoryService.js',
  // 'Rtc/LobbyService.js',
  // 'Designer/designer-layout.js',
  // 'NodeGraph/dom/node-graph.js',
  // 'NodeGraph/dom/node-graph-editor.js',
  // 'NodeCatalog/draggable-item.js',
  // 'NodeCatalog/NodeCatalogRecipe.js',
  // 'NewMedia/Nodes/Camera.js',
  // 'NewMedia/MediaService.js',
  // 'Mediapipe/FaceMeshService.js',
  // 'Mediapipe/SelfieSegmentationService.js',
  // 'Mediapipe/MediapipeNodes.js',
  // 'Threejs/ThreejsService.js',
  // 'Shader/ShaderService.js',
  // 'Shader/ShaderNodes.js',
  // 'TensorFlow/TensorFlow.js',
  // 'TensorFlow/CocoSsdService.js',
  // 'TensorFlow/CocoSsdNode.js',
  // 'Display/DisplayNodes.js',
  // 'RapsaiNodes/RapsaiImagesNode.js'
]);

// memoize important paths

const url = Paths.getAbsoluteHereUrl(import.meta, 1);

// remote libraries
//const rapsai = 'http://localhost:9876';
const rapsai = 'https://rapsai-core.web.app/0.5.1';
await import(`${rapsai}/Library/input-image.js`);

// important paths
Paths.add({
  $app: url,
  $config: `${url}/../config.js`,
  $library: Library,
  $rapsai: rapsai
});