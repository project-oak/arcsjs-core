/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../xen/xen-async.js';

const template = Xen.Template.html`
<!-- <style>
  :host {
    display: flex;
  }
</style>
<slot></slot> -->
`;

export class PageGroup extends Xen.Async {
  static get observedAttributes() {
    return ['selected'];
  }
  get template() {
    return template;
  }
  get host() {
    return this;
  }
  _didMount() {
    this.childrenChanged();
    this.observer = new MutationObserver(() => this.childrenChanged.bind(this));
    this.observer.observe(this, {childList: true});
    // TODO(sjmiles): this is bad, fix it properly asap
    setTimeout(() => this.childrenChanged(), 500);
  }
  childrenChanged() {
    //console.warn([...this.children].map(c => `${c.localName}#${c.id}`));
    this._invalidate();
  }
  update({selected}) {
    const index = Number(selected) || 0;
    const children = [...this.children];
    if (children) {
      children.forEach((c, i) => c.style.display = (i === index) ? null : 'none');
    }
    this.key = index;
  }
}