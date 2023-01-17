/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
const lib = `${globalThis.config.arcsPath}/Library`;
export const load = async paths => (await Promise.all(paths.map(p => import(`${lib}/${p}`)))).reduce((e, m) =>({...e, ...m}),{});

const etc = await load([
  'Arc/ArcNode.js',
  'Layout/LayoutNodes.js',
  'Layout/MaterialTabPagesNode.js',
  'Data/DisplayNode.js',
  'Fields/BooleanFieldNode.js',
  'Fields/LineObjectNode.js',
  'Fields/MultilineTextFieldNode.js',
  'Fields/SelectFieldNode.js',
  'Fields/TextFieldNode.js',
  /**/
  'Media/ImageNode.js',
  'Media/ImageCompositeNode.js',
  'Media/CameraNode.js',
  'Media/AudioNode.js',
  'Pixabay/PixabayNode.js',
  /**/
  'Fx/DetectRaisedHandNode.js',
  'Fx/FaceMeshStickerNode.js',
  'Mediapipe/PoseNode.js',
  'Mediapipe/FaceMeshNode.js',
  'Mediapipe/FaceMeshDisplayNode.js',
  'Mediapipe/SelfieSegmentationNode.js',
  'PixiJs/PixiJsNodes.js',
  'Shader/FragmentShaderNode.js',
  /**/
  'JSONata/JSONataNode.js',
  'Librarian/LibrarianNode.js',
  /**/
  'Node/NodeDesignerNode.js',
  'Node/NodeCatalogNode.js',
  'Node/NodeEditorNode.js',
  'Node/NodeTreeNode.js',
  'Node/NodeInspectorNode.js',
  'Node/NodeCreatorNode.js',
  'NodeGraph/GraphToolbarNode.js',
]);

const nodeTypes = {
  ...etc
};

const categories = {};

export {nodeTypes, categories};