/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
initialize(inputs, state, {service}) {
  state.addArcGraph = async data => await service({kind: 'ArcService', msg: 'addArcGraph', data});
},
shouldUpdate({nodeTypes, arcName, graph, graphName}) {
  return nodeTypes && arcName && (graph || graphName);
},
async update({arcName, graph, nodeTypes}, state) {
  if (keys(graph?.nodes).length) {
    await this.buildArcWithGraph({arcName, graph, nodeTypes}, state);
  }
},
async buildArcWithGraph({arcName, graph, nodeTypes}, state) {
  const result = state.addArcGraph({arc: arcName, graph, nodeTypes, defaultContainer: 'arc'})
  log(await result);
},
render() {
  // TODO(sjmiles): otherwise the system tries to render `state.addArcGraph` and throws
  return null;
},
template: html`<slot name="arc"></slot>`
})