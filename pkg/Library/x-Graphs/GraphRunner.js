/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
shouldUpdate({graph}) {
  return graph;
},
update({graph, live}, state, {service}) {
  let graph_ = graph;
  if (typeof graph === 'string') {
    try {
      graph_ = JSON.parse(graph);
    } catch(x) {
      graph_ = null;
      //log(x);
    }
  }
  if (graph_) {
    log('addRunnerGraph:', graph_, live);
    return live && service({msg: 'addRunnerGraph', data: {graph: graph_}});
  }
}
});
