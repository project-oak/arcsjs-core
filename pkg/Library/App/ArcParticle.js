/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
shouldUpdate({arcName}, state) {
  return arcName && (state.arcName !== arcName);
},
async update({arcName, ...etc}, state, {service}) {
  state.arcName = arcName;
  await this.doTheThing({arcName, ...etc}, state, {service})
},
async doTheThing({arcName, graphName, defaultContainer}, state, {service}) {
  defaultContainer = 'ArcNode1:arc#arc';
  const result = await service({kind: 'GraphService', msg: 'AddGraph', data: {arcName, graphName, defaultContainer}});
  log(result);
},
template: html`<div flex row frame="arc"></div>`
})