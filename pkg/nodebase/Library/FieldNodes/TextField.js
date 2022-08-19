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
onFieldChange({eventlet: {value}}) {
  return {value};
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
