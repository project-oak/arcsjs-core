/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
initialize(inputs, state, {service}) {
  state.addGraph = async data => await service({kind: 'ArcService', msg: 'addNamedGraph', data});
},
shouldUpdate({arcName, graphName}, {arc}) {
  return arcName && graphName && !arc;
},
async update({arcName, graphName}, state) {
  state.arc = true;
  await this.buildArcWithGraph({arcName, graphName, defaultContainer: 'ArcNode1:arc#arc'}, state)
},
async buildArcWithGraph({arcName, graphName, defaultContainer}, state) {
  const result = await state.addGraph({arcName, graphName, defaultContainer});
  log(result);
},
render() {
  return null;
},
template: html`<div flex column frame="arc"></div>`
})