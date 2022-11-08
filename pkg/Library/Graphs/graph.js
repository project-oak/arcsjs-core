/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Paths, Runtime, Arc, Chef} from '../Core/core.js';
import {initVanilla} from '../Isolation/vanilla.js';
import {RecipeBuilder} from './RecipeBuilder.js';
import {NodeTypes as nodeTypes} from '../GraphNodes/NodeTypes.js';
import {JSONataService} from '../JSONata/JSONataService.js';

initVanilla();

Paths.add({
  $library: '..'
});

const user = new Runtime('user');

const createArc = n => user.addArc(new Arc(n));

const arc = createArc('arc');
arc.service = async (host, request) =>{
 return JSONataService.evaluate(null, host, request);
};

export const graph = async graph => {
  const recipes = RecipeBuilder.construct({graph, nodeTypes});
  console.groupCollapsed('recipes');
  console.log(JSON.stringify(recipes, null, '  '));
  console.groupEnd();
  await Chef.executeAll(recipes, user, arc);
  console.log(user);
  return user;
};