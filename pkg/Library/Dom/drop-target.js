/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from './Xen/xen-async.js';

Xen.DropTarget = class extends Xen.Async {
  enableDrop() {
    this.addEventListener('dragenter', e => this.onDragEnter(e));
    this.addEventListener('dragover', e => this.onDragOver(e));
    this.addEventListener('drop', e => this.onDrop(e));
  }
  onDragOver(e) {
    e.preventDefault();
  }
  onDragEnter(e) {
    e.preventDefault();
  }
  onDrop(e) {
    this.value = e.dataTransfer?.getData('text/plain') || 'no dataTransfer';
  }
};

const template = Xen.Template.html`
<!-- <style>
  :host {
  }
</style> -->
<slot></slot>
`;

export class DropTarget extends Xen.DropTarget {
  get template() {
    return template;
  }
  _didMount() {
    this.enableDrop();
  }
}
customElements.define('drop-target', DropTarget);
