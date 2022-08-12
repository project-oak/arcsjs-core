/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../../Dom/Xen/xen-async.js';
import './data-item.js';

const template = Xen.Template.html`

<style>
  :host {
    display: block;
  }
</style>

<div>{{items}}</div>

`;

const templateDataItem = Xen.Template.html`

<data-item name="{{name}}" value="{{value}}" expand="{{expand}}" on-item-change="_onItemChange"></data-item>

`;

//const nob = Object.create(null);

class DataExplorer extends Xen.Base {
  static get observedAttributes() {
    return ['object', 'expand'];
  }
  get template() {
    return template;
  }
  _wouldChangeValue(map, name, value) {
    return (name === 'object') || super._wouldChangeValue(map, name, value);
  }
  _setValueFromAttribute(name, value) {
    // convert boolean-attribute to boolean
    if (name == 'expand') {
      value = (value != null);
    }
    super._setValueFromAttribute(name, value);
  }
  _render({object, expand}) {
    return {
      items: {
        template: templateDataItem,
        models: this._formatValues(object, expand)
      }
    };
  }
  _formatValues(object, expand) {
    if (object == undefined) {
      return [];
    }
    // because we are storing it
    expand = Boolean(expand);
    if (typeof object !== 'object') {
      return [{name: '', value: (object === null) ? 'null' : String(object), expand}];
    }
    // only do so many...
    const keys = Object.keys(object).slice(0, 100);
    return keys.map(name => ({name: `${name}:`, value: object[name], expand}));
  }
  _onItemChange(e) {
    //console.log(e.target.name, e.detail);
    this.object[e.target.name] = e.detail;
    this.dispatchEvent(new CustomEvent('object-change', {bubbles: true}));
  }
}
customElements.define('data-explorer', DataExplorer);
