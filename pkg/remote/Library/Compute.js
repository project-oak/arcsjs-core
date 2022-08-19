/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
/* global scope */
({
async update({pipeline}, state, {service}) {
},
onPlayClick(_, __, {service}) {
  service({msg: 'playClick'});
},
template: html`
<style>
  ${`:host {
    ${scope.themeRules}
  }`}
  [frame=camera] {
    padding: 8px;
    border: 1px solid silver;
    width: 240px;
    height: 180px;
  }
</style>
<div><icon on-click="onPlayClick">play_arrow</icon></div>
<div frame="devices"></div>
<div row frame="camera"></div>
<div flex row id="tvs"></div>
`
});
