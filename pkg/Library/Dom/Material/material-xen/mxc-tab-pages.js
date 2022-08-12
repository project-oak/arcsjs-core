/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../xen/xen-async.js';

const template = Xen.Template.html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    background-color: var(--theme-color-bg-2);
  }
  /* mwc-tab-bar {
  } */
</style>

<!-- tabs -->
<mwc-tab-bar activeindex="{{activeIndex:selected}}" on-change="MDCTabBar:activated=onTabActivated">{{tabs}}</mwc-tab-bar>
<!-- content -->
<slot></slot>

<template tabT>
  <mwc-tab label="{{label}}" active="{{active}}"></mwc-tab>
</template>
`;

export class MxcTabPages extends Xen.Async {
  static get observedAttributes() {
    return ['tabs', 'selected', 'disabletabs'];
  }
  get template() {
    return template;
  }
  _didMount() {
    this.commandeerTabControl();
    this.childrenChanged();
    this.observer = new MutationObserver(this.childrenChanged.bind(this));
    this.observer.observe(this, {childList: true});
  }
  commandeerTabControl() {
    this.bar = this.shadowRoot.querySelector('mwc-tab-bar');
    const die = e => {
      if (this.state.disable) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    };
    this.bar.addEventListener('click', die, true);
    this.bar.addEventListener('mousedown', die, true);
  }
  childrenChanged() {
    this.state = {children: [...this.children]};
  }
  update(inputs, state) {
    state.disable = inputs.disabletabs;
    if (state.defaultSelected !== inputs.selected) {
      state.selected = state.defaultSelected = inputs.selected;
    }
    state.selected = Number(state.selected) || 0;
    this.key = state.selected;
  }
  render({tabs: tabNames}, {children, selected}) {
    children?.forEach((c, i) => c.style.display = (i === this.key) ? null : 'none');
    const models = tabNames?.split(',')?.map((tab, i) => ({label: tab}));
    const tabs = models && {$template: "tabT", models};
    return {selected, tabs};
  }
  onTabActivated(e) {
    //console.log(e);
    this.state = {selected: e.detail.index};
    this.key = e.detail.index;
    this.fire('selected');
  }
}