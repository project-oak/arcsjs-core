/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
update({value, connectedValue}, state) {
  value = state.value = connectedValue ?? value;
  return {value};
},
render(inputs, {value}) {
  return {
    ...inputs,
    value
  };
},
onLabelChange({eventlet: {value}}) {
  return {label: value};
},
onFieldChange({eventlet: {value}}, state) {
  state.value = value;
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
