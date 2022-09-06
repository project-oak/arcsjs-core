/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
render({layout}) {
  const model = {};
  switch (layout) {
    case 'column':
      model.isColumn = true;
      break;
    case 'row':
      model.isRow = true;
      break;
  }
  return model;
},
template: html`
<style>
  :host {
    min-width: 120px;
    min-height: 120px;
    display: flex;
    border: 3px dotted darkorange;
    padding: 2px;
  }
  [frame="content"] > * {
    border-color: blue !important;
  }
  container-layout {
    background: repeating-linear-gradient(
      -45deg,
      #fefefe,
      #fefefe 5px,
      #f1f1f1 5px,
      #f1f1f1 10px
    );
  }
</style>
<div flex column$="{{isColumn}}" row$="{{isRow}}" frame="content"></div>
<!-- <container-layout flex column frame="items"></container-layout> -->
`
});