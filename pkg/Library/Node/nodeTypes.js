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
  'Fx/DetectRaisedHandNode.js',
  'Fx/FaceMeshStickerNode.js',
  'GraphsNodes/ImageNode.js',
  'GraphsNodes/CameraNode.js',
  'JSONata/JSONataNode.js',
  'Layout/LayoutNodes.js',
  'Mediapipe/PoseNode.js',
  'Mediapipe/FaceMeshNode.js',
  'Mediapipe/FaceMeshFaceNode.js', // rename to FaceMeshDisplayNode
  'NewMedia/AudioNode.js',
  'Node/NodeDesignerNode.js',
  'Node/NodeCatalogNode.js',
  'Node/NodeEditorNode.js',
  'Node/NodeTreeNode.js',
  'Node/NodeInspectorNode.js',
  'Pixabay/PixabayNode.js',
  'PixiJs/PixiJsNodes.js',
  'Shader/FragmentShaderNode.js'
]);

const nodeTypes = {
  ...etc
};

const categories = {};

export {nodeTypes, categories};