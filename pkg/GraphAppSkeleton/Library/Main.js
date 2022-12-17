/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
update({}, state) {
},
template: html`
<style>
  :host {
    color: var(--theme-color-fg-1);
    background-color: var(--theme-color-bg-0);
    ${globalThis.themeRules}
  }
</style>

<div bar style="background-color: #ffb861; color: black;">
  <img style="height: 48px; padding: 8px;" src="./assets/arcs-icon.png">
  <h3>Graph App</h3>
</div>

<div flex row frame="root"></div>
`
});
