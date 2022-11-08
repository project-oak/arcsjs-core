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
    ${globalThis.themeRules}
  }
  [title] {
    font-weight: bold;
    background-color: var(--theme-color-bg-1);
    padding: 32px;
  }
</style>

<div title center>HELLO   ARCS   GRAPHS</div>
<!-- <div flex frame="graph"></div> -->
<designer-layout flex frame="graph"></designer-layout>
`
});
