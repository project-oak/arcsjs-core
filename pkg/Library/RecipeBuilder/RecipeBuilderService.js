/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
 import {logFactory/*, Resources*/} from '../Core/core.js';

import {RecipeBuilder} from '../Graphs/RecipeBuilder.js';
import {NodeTypes} from '../GraphsNodes/NodeTypes.js';

const log = logFactory(logFactory.flags.services || logFactory.flags.RecipeBuilderService, 'RecipeBuilderService', 'coral');

//Resources.set(nodeTypesResource, nodeTypes);

export const RecipeBuilderService = {
  async build({graph/*, nodeTypesResource*/}) {
    try {
      log.groupCollapsed('building Graph...');
      if (typeof graph === 'string') {
        log('graph is in string format');
        graph = JSON.parse(graph.replace('/[""""]/g', '"'));
      }
      log('target graph:', graph);
      //const nodeTypes = Resources.get(nodeTypesResource);
      log('using NodeTypes:', NodeTypes);
      const recipes = await RecipeBuilder.construct({graph, NodeTypes});
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