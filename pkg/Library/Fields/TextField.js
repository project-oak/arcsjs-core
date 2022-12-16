/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
render(inputs) {
  return {
    ...inputs,
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
  }
  [label] {
    background: inherit;
    font-weight: bold;
    font-size: 75%;
    border: none;
    text-align: right;
    width: 8em;
  }
  [field] {
    padding: 6px 9px;
    border-radius: 4px;
    border: 1px solid #88888888;
  }
  [delim] {
    padding-right: 12px;
  }
</style>

<div flex bar>
  <input label value="{{label}}" on-change="onLabelChange">
  <span delim>:</span>
  <input flex field value="{{value}}" on-change="onFieldChange">
</div>
`
});
