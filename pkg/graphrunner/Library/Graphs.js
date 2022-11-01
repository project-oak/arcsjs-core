/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
template: html`
<style>
  :host {
    color: var(--theme-color-fg-1);
    background-color: var(--theme-color-bg-0);
    --mdc-icon-button-size: 24px;
    --mdc-icon-size: 16px;
    padding: 100px;
    ${globalThis.themeRules}
  }
  [frame="prompt"] {
    border: 1px solid purple;
    padding: 10px;
  }
  [columns] {
    border: 1px solid purple;
    padding: 10px;
  }
</style>

<div center><b>HELLO   ARCS   GRAPHS</b></div>
<br>
<div frame="prompt"></div>
<br>

<div flex columns> 
  <div flex rows> 
    <i>Result:</i>
    <br>
    <div frame="result"></div>
  </div>
  <div flex rows> 
    <i>Graph:</i>
    <br>
    <div frame="graph"></div>
  </div>
</div>

`
});
