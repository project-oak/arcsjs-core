/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../xen/xen-async.js';

/**
 * Wraps MWC-TAB-BAR to implement `value` property
 */

const template = Xen.Template.html`
<mwc-tab-bar activeindex="{{activeIndex:selected}}" files on-change="MDCTabBar:activated=onTabActivated">
  <slot></slot>
</mwc-tab-bar>
`;

export class MxcTabBar extends Xen.Async {
  static get observedAttributes() {
    return ['selected'];
  }
  get template() {
    return template;
  }
  onTabActivated(e) {
    this.key = e.detail.index;
    this.fire('selected');
  }
  render(inputs) {
    return inputs;
  }
}
