/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

({

async update({graph}, state, {service}) {
  if (graph && !deepEqual(graph, state.graph)) {
    state.graph = graph;
    log(`RUNNING THE GRAPH: ${JSON.stringify(graph)}`);
    const result = await service({msg: 'RunGraph', data: {graph}});
    return {result};
  }
}

});
