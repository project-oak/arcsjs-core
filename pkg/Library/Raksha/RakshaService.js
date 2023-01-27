
/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../../graph/conf/arcs.js';
import {PolicyGenerator} from './RecipeToIr.js';

const log = logFactory(logFactory.flags.services || logFactory.flags.RakshaService, 'RakshaService', 'coral');

const server = `https://arcsjs-chromium.arcsjs.dev/raksha`;

export const RakshaService = {
  async test({recipes}) {
    log('testing recipes:', recipes);
    try {
      if (recipes.length) {
        const ir = recipesToIr(recipes);
        return await irToRaksha(ir);
      }
    } catch(x) {
      log('Failed:', x);
    }
    return false;
  }
};

const recipesToIr = recipes => {
  const policy = new PolicyGenerator(recipes, 'LeRecipe');
  const ir = policy.recipeToIr();
  log(ir);
  return ir;
};

const irToRaksha = async ir => {
  const response = await fetch(`${server}`, {
    method: 'POST',
    body: ir
  });
  const value = await response.text();
  log(value);
  return value === "0";
};