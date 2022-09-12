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
    flex: none !important;
    height: 120px;
  }
  [frame=grabber] {
    width: 128px;
  }
</style>
<div flex row>
  <div column flex frame="lobby"></div>
  <div column frame="grabber"></div>
</div>
`
});
