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
      if (typeof graph === 'string') {
        graph = JSON.parse(graph.replace('/[""""]/g', '"'));
      }
      log('building graph', graph);
      //const nodeTypes = Resources.get(nodeTypesResource);
      log('got NodeTypes', NodeTypes);
      const recipes = await RecipeBuilder.construct({graph, NodeTypes});
      log('made recipes', recipes);
      return recipes;
    } catch(x) {
      log('failed:', x?.message);
      return [];
    }
  }
};