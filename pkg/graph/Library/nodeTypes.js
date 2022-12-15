/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
// import {RecipeBuilderNode} from './RecipeBuilder/RecipeBuilderNode.js';
// import {OpenAiGpt3Node} from './OpenAi/OpenAiGpt3Node.js';
// import {OpenAiGpt3TextNode} from './OpenAi/OpenAiGpt3TextNode.js';
// import {OpenAiImageNode} from './OpenAi/OpenAiImageNode.js';
// import {CallosumNode} from './Callosum/CallosumNode.js';
// import {RakshaNode} from './Raksha/RakshaNode.js';
// import * as sendNodes from './Raksha/SendNodes.js';
// import {LamdaNode} from './PPSouth/LamdaNode.js';
// import {StableDiffusionNode} from './PPSouth/StableDiffusionNode.js';

//import * as generatorNodes from './PPSouth/GeneratorNodes.js';
//import * as generatorNodes from './Demo/SimpleGeneratorNodes.js';

//import * as DemoBookNodes from './Demo/DemoNodes.js';

const lib = `${globalThis.config.arcsPath}/Library`;
export const load = async paths => (await Promise.all(paths.map(p => import(`${lib}/${p}`)))).reduce((e, m) =>({...e, ...m}),{});

const etc = await load([
  'NewMedia/ImageNode.js',
  'Layout/LayoutNodes.js',
  'NodeCatalog/NodeCatalogNode.js'
  // 'GraphsNodes/NodeTypes.js',
  // 'Shader/ShaderNodes.js',
  // 'Mediapipe/MediapipeNodes.js',
  // 'Pixabay/PixabayNode.js',
  // 'CodeMirror/CodeMirrorNode.js',
  // 'NewMedia/ImageCompositeNode.js',
  // 'NewMedia/ImageNode.js',
  // 'Display/BarDisplayNode.js',
  // 'TensorFlow/MobilenetNodes.js',
  // 'NodeGraph/EditorNode.js'
]);

const nodeTypes = {
  // ...DemoBookNodes,
  // OpenAiGpt3Node,
  // OpenAiGpt3TextNode,
  // OpenAiImageNode,
  // CallosumNode,
  // RakshaNode,
  // ...sendNodes,
  // RecipeBuilderNode,
  // LamdaNode,
  // StableDiffusionNode,
  //...generatorNodes,
  ...etc,
};

console.log(nodeTypes);

const categories = {};

export {nodeTypes, categories};