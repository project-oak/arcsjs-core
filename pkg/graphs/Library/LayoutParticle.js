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
    padding: 32px;
    ${globalThis.themeRules}
  }
</style>
<pre frame="data"></pre>
<div frame="query"></div>
<div frame="result"></div>
`
});
