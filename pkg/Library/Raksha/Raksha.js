/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
initialize(inputs, state, {service}) {
  state.builder = graph => service({kind: 'RecipeBuilderService', msg: 'build', data: {graph}});
  state.raksha = recipes => service({kind: 'RakshaService', msg: 'test', data: {recipes}});
},
shouldUpdate({graph}) {
  return graph;
},
async update({graph}, state) {
  if (typeof graph === 'string') {
    try {
      graph = JSON.parse(graph);
    } catch(x) {
      return;
    }
  }
  const recipes = await state.builder(graph);
  state.graphOk = await state.raksha([...recipes]);
  return {
    verifiedGraph: state.graphOk ? graph : null
  };
},
render(inputs, {graphOk}) {
  return {
    fail: !graphOk,
    msg: graphOk
      ? 'Policy checks successful.<br>No private information is leaving the system.'
      : 'Policies cannot be satisfied.<br>Private information is not allowed public egress, or no graph is presented.'
  };
},
template: html`
<style>
  span {
    color: green;
  }
  [fail] {
    color: red;
    font-weight: bold;
  }
</style>
<div row centering>
  <div>
    <span fail$="{{fail}}" unsafe-html="{{msg}}"></span>
  </div>
</div>
`
});
