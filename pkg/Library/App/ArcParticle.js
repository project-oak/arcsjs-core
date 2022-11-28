/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
shouldUpdate({arcName, graphName}, state) {
  return arcName && (state.arcName !== arcName);
},
async update({arcName, graphName}, state, {service}) {
  state.arcName = arcName;
  await this.doTheThing({arcName, graphName}, state, {service})
},
async doTheThing({arcName, graphName}, state, {service}) {
  const result = await service({kind: 'GraphService', msg: 'AddGraph', data: {arcName, graphName}});
  log(result);
},
template: html`<div frame="arc"></div>`
})