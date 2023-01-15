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

const modules = await load([
  'Mediapipe/PoseService.js',
  'App/HistoryService.js',
  'Arc/ArcService.js',
  // 'NewMedia/MediaService.js',
  // 'Goog/GoogleApisService.js',
  // 'Mediapipe/FaceMeshService.js',
  // 'Mediapipe/SelfieSegmentationService.js',
  // 'Threejs/ThreejsService.js',
  // 'TensorFlow/TensorFlowService.js',
  // 'TensorFlow/CocoSsdService.js',
  // 'Shader/ShaderService.js'
]);

export const services = modules;
