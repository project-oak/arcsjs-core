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
  'App/HistoryService.js',
  'Arc/ArcService.js',
  'Rtc/LobbyService.js',
  'Goog/GoogleApisService.js',
  'NewMedia/MediaService.js',
  'Mediapipe/FaceMeshService.js',
  'Mediapipe/SelfieSegmentationService.js',
  'Mediapipe/PoseService.js',
  'Threejs/ThreejsService.js',
  'Shader/ShaderService.js',
  'TensorFlow/TensorFlowService.js',
  'TensorFlow/CocoSsdService.js'
]);

export const {HistoryService} = modules;
export const {MediaService} = modules;
export const {FaceMeshService} = modules;
export const {SelfieSegmentationService} = modules;
export const {ThreejsService} = modules;
export const {ShaderService} = modules;
export const {TensorFlowService} = modules;
export const {CocoSsdService} = modules;
export const {LobbyService} = modules;
export const {GoogleApisService} = modules;
export const {ArcService} = modules;
export const {PoseService} = modules;