/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

//import * as candyNodes from './CandyNodes.js';
import * as builderNodes from './BuilderNodes.js';
import * as testNodes from './TestNodes.js';
// import * as locationNodes from '../../Library/nostalgic/Goog/LocationNodes.js';
// import * as homescreen from '../../Library/nostalgic/Homescreen/HomescreenRecipes.js';
// import * as speech from '../../Library/nostalgic/Actions/SpeechRecipes.js';
// import * as translator from '../../Library/nostalgic/Actions/TranslationDisplayRecipe.js';
import * as newMediaNodes from '../../../Library/NewMedia/Fields/Nodes.js';
import * as baseFieldNodes from '../../../nodebase/Library/FieldNodes/FieldNodes.js';

const fieldNodes = Object.values(baseFieldNodes).map(node => {
  const newNode = {...node};
  Object.keys(newNode).forEach(key => {
    if (newNode[key].$kind) {
      newNode[key].$kind = newNode[key].$kind.replace('$app', '$app/../nodebase/');
    }
  });
  return newNode;
});

export const nodeTypes = [
  ...Object.values(builderNodes),
  ...Object.values(newMediaNodes),
  ...fieldNodes,
  ...Object.values(testNodes),
  //...Object.values(candyNodes),
  // ...Object.values(locationNodes),
  // ...Object.values(homescreen),
  // ...Object.values(speech),
  // ...Object.values(translator)
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
