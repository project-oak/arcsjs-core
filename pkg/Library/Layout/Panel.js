/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
render({layout, center, style}) {
  return {
    style,
    isRow: layout === 'row',
    isColumn: layout !== 'row',
    center
  };
},
template: html`
<style>
  :host {
    font-size: 1em;
  }
</style>
<div flex xen:style="{{style}}" row$="{{isRow}}" column$="{{isColumn}}" center$="{{center}}" frame="container"></div>
`
});
