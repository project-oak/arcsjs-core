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
  quickStart,
  LocalStoragePersistor,
  HistoryService, MediaService,
  TensorFlowService,
  FaceMeshService, SelfieSegmentationService,
  MediapipeNodes,
  ThreejsService, ShaderService,
  CocoSsdService,
  LobbyService,
  // must be last
  ...etc
} = await load([
  'Core/utils.js',
  //
  'App/Worker/App.js',
  'App/Resources.js',
  'App/Params.js',
  'App/HistoryService.js',
  'App/boot.js',
  //
  'App/common-dom.js',
  'Designer/designer-layout.js',
  //
  'PixiJs/pixi-view.js',
  //
  'LocalStorage/LocalStoragePersistor.js',
  'Media/DeviceUxRecipe.js',
  //
  'TensorFlow/TensorFlow.js',
  'TensorFlow/TensorFlowService.js',
  'Rtc/LobbyService.js',
  'NewMedia/MediaService.js',
  'Mediapipe/FaceMeshService.js',
  'Mediapipe/SelfieSegmentationService.js',
  'Threejs/ThreejsService.js',
  'Shader/ShaderService.js',
  'TensorFlow/CocoSsdService.js',
  //
  'NewMedia/CameraNode.js',
  'Shader/ShaderNodes.js',
  'Mediapipe/MediapipeNodes.js',
  'TensorFlow/CocoSsdNode.js',
  'Display/DisplayNodes.js'
]);
