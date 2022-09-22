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
    padding: 12px;
    color: var(--theme-color-fg-0);
  }
</style>

<h2>Circus of Values</h2>

<div flex grid>
  <div repeat="item_t">{{items}}</div>
</div>

<template item_t>
  <div>{{name}}</div>
</template>
`
});
