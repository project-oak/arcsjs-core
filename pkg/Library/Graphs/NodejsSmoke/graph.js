/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Paths, Runtime, Arc, Chef} from '../../Core/core.js';
import {initVanilla} from '../../Isolation/vanilla.js';
import {JSONataService} from '../../JSONata/JSONataService.js';
import {NodeTypes as nodeTypes} from './NodeTypes.js';
import {RecipeBuilder} from '../RecipeBuilder.js';

initVanilla();

const user = new Runtime('user');
user.createArc = n => user.addArc(new Arc(n));

const arc = user.createArc('arc');
arc.service = async (host, request) => {
  console.log(request);
  JSONataService.evaluate(null, host, request);
};

export const graph = async graph => {
  console.log(Paths.map);
  console.log(Paths.resolve('$library'));
  const recipes = RecipeBuilder.construct({graph, nodeTypes});
  await Chef.executeAll(recipes, user, arc);
  return user;
};