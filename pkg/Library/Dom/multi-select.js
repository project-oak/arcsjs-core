/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Xen} from './Xen/xen-async.js';

export class MultiSelect extends Xen.Async {
  static get observedAttributes() {
    return ['disabled', 'selected', 'multiple', 'options'];
  }

  _didMount() {
    this.selector = this._dom.$('select');
  }

  update(inputs, state) {
    Object.assign(state, inputs);
    state.options = inputs.options?.map(opt =>
      typeof opt === 'string' ? {key: opt, name: opt} : opt
    );
  }

  onChange() {
    const values = [];
    for (const option of this.selector.options) {
      if (option.selected && option.value) {
        values.push(option.value);
      }
    }
    this.value = this.state.multiple ? values : values?.[0];
    this.fire('change');
  }

  get template() {
    return Xen.Template.html`
<style>
  [options] {
    font-size: 12px;
    width: 100%;
    border: 1px solid var(--theme-color-fg-0);
    border-radius: 4px;
    padding: 4px;
  }
</style>

<select options disabled="{{disabled}}" multiple="{{multiple}}" on-change="onChange"
  repeat="select_option_t">{{options}}</select>

<template select_option_t>
  <option selected="{{selected}}" value="{{key}}">{{name}}</option>
</template>
`;
  }
}

customElements.define('multi-select', MultiSelect);
