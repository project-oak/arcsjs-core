/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../Core/core.js';
import {RecipeBuilder} from './RecipeBuilder.js';

const log = logFactory(logFactory.flags.services || logFactory.flags.RecipeBuilderService, 'RecipeBuilderService', 'pink', 'black');

export const RecipeBuilderService = {
  // must be attached to the service by owner
  nodeTypes: {},
  async build({graph}) {
    try {
      log.groupCollapsed('Graph -> Recipes');
      if (typeof graph === 'string') {
        log('graph is in string format');
        graph = JSON.parse(graph.replace('/[""""]/g', '"'));
      }
      log('source graph:', graph);
      log('using NodeTypes:', this.nodeTypes);
      const recipes = await RecipeBuilder.construct({graph, layoutId: 'preview', nodeTypes: this.nodeTypes});
      log('made recipes:', recipes);
      log.groupEnd();
      return recipes;
    } catch(x) {
      log.groupEnd();
      log('failed:', x?.message);
      return [];
    }
  }
};
