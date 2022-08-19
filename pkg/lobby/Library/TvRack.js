/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
update({}, state, tools) {
},
render({}, {}, tools) {
},
template: html`
<style>
  :host {
    flex: 2 !important;
  }
  #rack {
    flex: 1;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: flex-start;
  }
  #rack > * {
    border-color: lightblue;
  }
  ::slotted(*) {
    min-width: 160px;
    min-height: 90px;
    margin: 8px;
  }
</style>
<div id="broadcaster"></div>
<div id="rack">
  <slot></slot>
</div>
`
});