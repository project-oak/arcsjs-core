/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../../Dom/Xen/xen-async.js';
import {IconsCss} from '../../../Dom/material-icon-font/icons.css.js';

import '../data-explorer/data-explorer.js';
// TODO(sjmiles): inelegant layering: we shouldn't depend on users here, it's just a shortcut
//import {Users} from '../../env/arcs/dist/ergo/users.js';

const template = Xen.Template.html`
<style>
  ${IconsCss}
  :host {
    display: block;
    font-size: 10px;
  }
  [header] {
    padding: 8px 6px;
    display: flex;
    align-items: center;
    font-size: 125%;
    line-height: 150%;
  }
  tenant-icon {
    width: 32px;
    height: 32px;
    margin-right: 8px;
  }
  icon {
    font-size: 125%;
    margin-right: 6px;
  }
  [store] {
    border-bottom: 1px dotted silver;
  }
  [data] {
    overflow: hidden;
    box-sizing: border-box;
    transition: all 300ms ease-out;
  }
  [stores] {
    background: #e6ebf5;
    color: black;
  }
  [flex] {
    flex: 1;
  }
</style>

<div stores>
  <div header>
    <b><span>Stores View</span></b>
  </div>
  <div>{{stores}}</div>
</div>
`;

const storeTemplate = Xen.Template.html`
  <div store key="{{id}}" on-click="onStoreClick">
    <div header>
      <tenant-icon avatar="{{avatar}}"></tenant-icon>
      <icon xen:style="{{shareStyle}}">{{shareIcon}}</icon>
      <icon xen:style="{{persistStyle}}">{{persistIcon}}</icon>
      <b><span>{{name}}</span></b>:&nbsp;
      <span>{{type}}</span><span>{{collectionInfo}}</span>
      <!-- <span flex></span>
      <span>{{tags}}</span> -->
    </div>
    <div data xen:style="{{dataStyle}}">
      <div style="padding: 8px 6px;">
        <div style="border-bottom: 1px dotted silver; margin-bottom: 2px; text-align: right;">
          id: <span>{{id}}</span><br>
          tags: <span>{{tags}}</span>
        </div>
        <data-explorer style="font-size: 14px;" object="{{data}}"></data-explorer>
      </div>
    </div>
  </div>
`;

export class DatasetView extends Xen.Async {
  static get observedAttributes() {
    return ['dataset'];
  }
  get template() {
    return template;
  }
  update({dataset}, state) {
    if (dataset && dataset !== state.dataset) {
      if (state.dataset) {
        state.dataset.unlisten(state.listener);
      }
      state.dataset = dataset;
      state.listener = dataset.listen('doc-changed', this.onDatasetChange.bind(this));
    }
  }
  onDatasetChange() {
    this._invalidate();
  }
  shouldRender({dataset}) {
    return Boolean(dataset);
  }
  render({dataset}) {
    return {
      stores: this.renderList(storeTemplate, dataset.storesArray, this.renderStoreModel)
    };
  }
  renderList(template, items, renderItem) {
    return {template, models: items.map(renderItem.bind(this))};
  }
  renderStoreModel(store) {
    const {meta} = store;
    const data = store.getProperty() || {};
    const shared = store.isShared() || store.wasShared;
    const tags = meta.tags.length ? meta.tags.join(', ') : '';
    return {
      shareStyle: shared ? `color: green;` : `color: #88888840;`,
      shareIcon: store.isPublic() ? 'shared' : shared ? `cloud_upload` : `cloud_off`,
      persistStyle: store.isPersisted() ? `color: violet;` : `color: #88888840;`,
      persistIcon: store.isPersisted() ? `cloud_upload` : `cloud_off`,
      avatar: store.ownerIcon || `./lib/assets/users/user.png`,
      owner: meta.owner,
      name: meta.name,
      type: meta.type,
      tags,
      collectionInfo: store.isCollection() ? `[${Object.keys(data).length}]` : '',
      id: store.id,
      dataStyle: store.showData ? {height: null} : {height: '0px'},
      json: data === undefined ? `&lt;empty&gt;` : JSON.stringify(data, null, '  '),
      data
    };
  }
  onStoreClick(e) {
    const id = e.currentTarget.key;
    const store = this.dataset.get(id);
    if (store) {
      store.showData = !store.showData;
    }
    this._invalidate();
  }
}
