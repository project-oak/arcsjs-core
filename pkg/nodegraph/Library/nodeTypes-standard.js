/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {categorize} from './categories.js';
import * as customNodes from './Librarian/CustomNodes.js';
import * as newMediaNodes from '../../Library/NewMedia/Nodes.js';
import * as displayNodes from '../../Library/Display/DisplayNodes.js';
import * as shaderNodes from '../../Library/Shader/ShaderNodes.js';
import * as mediapipeNodes from '../../Library/Mediapipe/MediapipeNodes.js';
import {ThreejsEditorNode} from '../../Library/Threejs/ThreejsEditorNode.js';
import {JSONataNode} from '../../Library/JSONata/JSONataNode.js';
import {CocoSsdNode} from '../../Library/TensorFlow/CocoSsdNode.js';
import {MobilenetNode} from '../../Library/TensorFlow/MobilenetNodes.js';
import {GoogleMapNode} from '../../Library/Goog/GoogleMapNode.js';
import {MacroRunnerNode} from '../../Library/Goog/MacroRunnerNode.js';
import * as fieldNodes from '../../Library/Fields/FieldNodes.js';
import * as nodeGraphNodes from '../../Library/NodeGraph/NodeGraphNodes.js';
import * as testNodes from './TestNodes.js';
import * as ContainerNodes from './ContainerNodes.js';
import * as pixijsNodes from '../../Library/PixiJs/PixiJsNodes.js';
// backburner
//import {PoemNode} from './PoemNode.js';
//import {isPoisonousNode} from './isPoisonousNode.js';
//import * as candyNodes from './Nodes/CandyNodes.js';
//import {SceneNode} from '../../Library/AFrame/SceneNode.js';

const {values} = Object;

export const nodeTypes = {};

// make an ... array?
const nodeTypesList = [
  ...values(newMediaNodes),
  ...values(mediapipeNodes),
  CocoSsdNode,
  MobilenetNode,
  ...values(pixijsNodes),
  ...values(shaderNodes),
  ThreejsEditorNode,
  ...values(displayNodes),
  ...values(customNodes),
  GoogleMapNode,
  MacroRunnerNode,
  //SceneNode,
  //
  ...values(nodeGraphNodes),
  ...values(fieldNodes),
  ...values(ContainerNodes),
  ...values(testNodes),
  //...values(candyNodes),
  // ...values(locationNodes),
  // ...values(homescreen),
  // ...values(speech),
  // ...values(translator)
  JSONataNode
];

// convert array into Object?
nodeTypesList.forEach(nodeType => {
  let {category, name} = nodeType.$meta;
  let id =  nodeType.$meta.id;
  if (id) {
    if (nodeTypes[id]) {
      console.warn(`Skipping non unique NodeType id='${id}'`);
    }
    nodeTypes[id] = nodeType;
  } else {
    console.warn(`Missing 'key' for NodeType '${name}' (category='${category}')`);
  }
});

// compute categories from Array
export const categories = categorize(nodeTypesList);
