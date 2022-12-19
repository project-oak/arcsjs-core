/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
render({label, value}) {
  return {
    label: label ?? '',
    value: value ?? ''
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
    display: flex;
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
    font-size: 1em;
    font-family: 'Goole Sans', sans-serif;
    width: 100%;
    height: 100%;
  }
  [delim] {
    padding-right: 12px;
  }
</style>

<div flex bar>
  <input label value="{{label}}" on-change="onLabelChange">
  <span delim>:</span>
  <textarea field value="{{value}}" on-change="onFieldChange"></textarea>
</div>
`
});
