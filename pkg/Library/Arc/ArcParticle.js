/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
initialize(inputs, state, {service}) {
  state.addNamedGraph = async data => await service({kind: 'ArcService', msg: 'addNamedGraph', data});
  state.addGraph = async data => await service({kind: 'ArcService', msg: 'addNamedGraph', data});
},
shouldUpdate({arcName, graphName}, {arc}) {
  return arcName && graphName && !arc;
},
async update({arcName, graph, graphName}, state) {
  state.arc = true;
  await this.buildArcWithGraph({arcName, graph, graphName, defaultContainer: 'ArcNode1:arc#arc'}, state)
},
async buildArcWithGraph({arcName, graph, graphName, defaultContainer}, state) {
  let result;
  if (graph) {
    result = state.addGraph({arc: arcName, graph, defaultContainer})
  } else {
    result = state.addNamedGraph({arc: arcName, graphName, defaultContainer});
  }
  log(await result);
},
render() {
  return null;
},
template: html`<slot name="arc"></slot>`
})