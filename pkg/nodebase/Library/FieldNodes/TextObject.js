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
    min-width: 4em;
    min-height: 1em;
    background: default;
  }
</style>

<div xen:style="{{textStyle}}" flex bar>{{text}}</div>
`
});
