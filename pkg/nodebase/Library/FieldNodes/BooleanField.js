/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
onLabelChange({eventlet: {value}}) {
  return {label: value};
},
onValueChange({value}) {
  return {value: !value};
},
template: html`
<style>
  :host {
    padding: 0 6px;
    height: 2em;
    width: 6em;
  }
  [label] {
    background: inherit;
    font-weight: bold;
    font-size: 75%;
    border: none;
    text-align: right;
  }
  [delim] {
    padding-right: 9px;
  }
</style>
<div flex bar>
  <input label value="{{label}}" on-change="onLabelChange">
  <span delim>:</span>
  <input field type="checkbox" checked="{{value}}" on-change="onValueChange">
</div>
`

});
