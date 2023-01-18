/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Xen} from './Xen/xen-async.js';

export class FancyInput extends Xen.Async {
  static get observedAttributes() {
    return ['focus', 'disabled', 'value'];
  }
  _didMount() {
    this.input = this._dom.$('input');
  }
  render({value, disabled}) {
    return {
      value,
      type: 'text',
      disabled: (disabled == '') || Boolean(disabled)
    };
  }
  _didRender({focus}, state) {
    if (focus !== state.isFocused) {
      state.isFocused = focus;
      if (focus) {
        this.input.select();
      }
      this.input[focus ? 'focus' : 'blur']();
    }
  }
  onChange() {
    this.value = this.input.value;
    this.fire('change');
  }
  get template() {
    return Xen.Template.html`
<style>
  input {
    border-color: inherit;
    border-radius: 6px;
    background-color: inherit;
    padding: 4px 6px;
    box-sizing: border-box;
    width: 100%;
  }
</style>
<input disable="{{disabled}}" type="{{type}}" value="{{value}}" on-change="onChange">
`;
  }
}

customElements.define('fancy-input', FancyInput);
