/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
render({label, value, options}, state) {
  return {
    label,
    value,
    options
  };
},
onLabelChange({eventlet: {value}}) {
  return {label: value};
},
onFieldChange({eventlet: {value}}) {
  return {value};
},
template: html`
<style>
  :host {
    padding: 0 6px;
    height: 2em;
    width: 24em;
  }
  [label] {
    background: inherit;
    font-weight: bold;
    font-size: 75%;
    border: none;
    text-align: right;
  }
  [delim] {
    padding-right: 12px;
  }
</style>

<div flex bar>
  <input label value="{{label}}" on-change="onLabelChange">
  <span delim>:</span>
  <multi-select flex field options="{{options}}" value="{{value}}" on-change="onFieldChange"></multi-select>
</div>
`
});
