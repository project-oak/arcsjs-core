/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
const lib = `${globalThis.config.arcsPath}/Library`;
export const load = async paths => (await Promise.all(paths.map(p => import(`${lib}/${p}`)))).reduce((e, m) =>({...e, ...m}),{});

const etc = await load([
  'Data/DisplayNode.js',
  'Fields/BooleanFieldNode.js',
  'Fields/LineObjectNode.js',
  'Fields/MultilineTextFieldNode.js',
  'Fields/SelectFieldNode.js',
  'Fields/TextFieldNode.js',
  'GraphsNodes/ImageNode.js',
  'GraphsNodes/CameraNode.js',
  'Layout/LayoutNodes.js',
  'NodeCatalog/NodeCatalogNode.js',
  'NodeInspector/NodeInspectorNode.js',
  'Mediapipe/PoseNode.js',
  'Fx/DetectRaisedHandNode.js'
]);

const nodeTypes = {
  ...etc
};

const categories = {};
export {nodeTypes, categories};