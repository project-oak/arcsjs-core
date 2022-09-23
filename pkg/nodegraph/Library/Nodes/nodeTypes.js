/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import * as nodeGraphNodes from './NodeGraphNodes.js';
import * as testNodes from './TestNodes.js';
import * as miscNodes from './MiscNodes.js';
import * as baseFieldNodes from '../FieldNodes/FieldNodes.js';
import * as candyNodes from './CandyNodes.js';
import * as customNodes from '../Librarian/CustomNodes.js';
import * as mediapipeNodes from '../../../Library/Mediapipe/MediapipeNodes.js';
import * as newMediaNodes from '../../../Library/NewMedia/Nodes/Nodes.js';
import * as mobilenetNodes from '../../../Library/Mobilenet/MobilenetNodes.js';
import * as displayNodes from '../../../Library/Display/DisplayNodes.js';
import * as shaderNodes from '../../../Library/Shader/ShaderNodes.js';

const fieldNodes = Object.values(baseFieldNodes).map(node => {
  const newNode = {...node};
  Object.keys(newNode).forEach(key => {
    if (newNode[key].$kind) {
      newNode[key].$kind = newNode[key].$kind.replace('$app', '$app/../nodebase/');
    }
  });
  return newNode;
});

const {values} = Object;

export const nodeTypes = [
  ...values(newMediaNodes),
  ...values(mediapipeNodes),
  ...values(nodeGraphNodes),
  ...fieldNodes,
  ...values(miscNodes),
  ...values(testNodes),
  ...values(candyNodes),
  ...values(mobilenetNodes),
  ...values(displayNodes),
  ...values(shaderNodes),
  ...values(customNodes)
  // ...values(locationNodes),
  // ...values(homescreen),
  // ...values(speech),
  // ...values(translator)
];

const icons = ['coffee', 'shower', 'chair', 'flatware', 'light', 'casino', 'escalator', 'umbrella', 'theater_comedy', 'diamond'];
const colors = ['#540d6e', '#ee4266', '#ffd23f', '#3bceac', '#0ead69', '#335c67', '#fff3b0', '#e09f3e', '#9e2a2b', '#540b0e'];
export const categories = {};
[...new Set(nodeTypes.map(n => n.$meta.category))].forEach((category, i) => {
  categories[category] = {
    icon: icons[i % (icons.length - 1)],
    color: `${colors[i % (colors.length - 1)]}ff`,
    bgColor: `${colors[i % (colors.length - 1)]}33`,
  };
});

// globalThis.nodeTypes = nodeTypes;
//builderNodes.NodeCatalog.$stores.nodeTypes.$value = nodeTypes;
