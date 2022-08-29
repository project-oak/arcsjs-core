/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Xen} from '../Dom/Xen/xen-async.js';
//import {DragDrop} from '../Dom/drag-drop.js';
import {IconsCss} from '../Dom/Material/material-icon-font/icons.css.js';

export const {assign} = Object;

export const XenPlus = class extends Xen.Async {
  // onShortcut(event) {
  //   // Delete the selected node or edge when pressing the "backspace" or "delete" key .
  //   if (event.key === 'Backspace' || event.key === 'Delete') {
  //     this.deleteAction(this.target);
  //   }
  // }
  // setupKeyboardShortcuts() {
  //   document.addEventListener('keydown', (event) => {
  //     if (!this.hasActiveInput()) {
  //       // Delete the selected node or edge when pressing the "backspace" or "delete" key .
  //       if (event.key === 'Backspace' || event.key === 'Delete') {
  //         this.deleteAction(this.target);
  //       }
  //     }
  //   });
  // }
  hasActiveInput() {
    const active = this.getActiveElement(document);
    return active?.contentEditable
      || ['INPUT', 'SELECT', 'TEXTAREA'].includes(active?.tagName)
      ;
  }
  getActiveElement({activeElement}) {
    return activeElement?.shadowRoot ? this.getActiveElement(activeElement.shadowRoot) : activeElement;
  }
};