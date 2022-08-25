/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
/* global scope */
({
async update({pipeline}, state, {service}) {
},
onAccountClick() {
  return {showFlyout: true};
},
template: html`
<style>
  /* :host {
    position: relative;
  } */
  /* ${`:host {
    ${scope.themeRules}
  }`} */
  [video] {
    position: relative;
  }
  /* [frame="tv"] > * {
    flex: 1 !important;
  } */
  [frame=camera] {
    display: none !important;
    position: absolute;
    border: 1px solid silver;
    padding: 8px;
    top: 32px;
    right: 8px;
    width: 240px;
    height: 180px;
    overflow: hidden;
  }
</style>
<div row>
  <div frame="devices"></div>
  <span flex></span>
  <div toolbar><icon on-click="onAccountClick">account_circle</icon></div>
</div>
<div flex row video>
  <div flex row frame="tv"></div>
  <div frame="camera"></div>
</div>
`
});
