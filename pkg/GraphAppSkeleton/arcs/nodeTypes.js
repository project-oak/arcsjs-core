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
  'GraphsNodes/ImageNode.js',
  'GraphsNodes/CameraNode.js',
  'GraphsNodes/MultilineTextFieldNode.js',
  'Layout/LayoutNodes.js',
  'NodeCatalog/NodeCatalogNode.js',
  'NodeInspector/NodeInspectorNode.js',
  'Mediapipe/PoseNode.js',
  'Fx/DetectRaisedHandNode.js'
]);

const nodeTypes = {
  ...etc
};

console.log(nodeTypes);

const categories = {};
export {nodeTypes, categories};