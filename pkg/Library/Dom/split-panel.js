/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from './Xen/xen-async.js';
import {DragDrop} from './drag-drop.js';

const template = Xen.Template.html`
<style>
  :host {
    width: 100%;
    height: 100%;
    display: flex;
  }
  [resizer] {
    width: 7px;
    /* height: 100%; */
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ew-resize;
  }
  [resizer]:hover,
  [resizer][dragging] {
    background-color: #e6e6e6;
  }
  [handle] {
    width: 2px;
    height: 12px;
    background-color: #ccc;
    border: 1px solid white;
  }
  [startside] {
    min-width: 16px;
  }
</style>

<div startside xen:style="{{startStyle}}"></div>
<div resizer dragging$="{{dragging}}" on-pointerdown="onDown">
  <div handle></div>
</div>
<div endside flex></div>

`;

export class SplitPanel extends DragDrop {
  get template() {
    return template;
  }

  async _didMount() {
    // Up listener for dragging the image grid resizer.
    this.upListener = () => {
      document.body.style.cursor = 'default';
      window.removeEventListener('pointerup', this.upListener);
      this.mergeState({dragging: false});
    };
  }

  update({}, state) {
    if (!state.divider) {
      state.divider = 120;
    }
  }

  render({}, {divider, dragging}) {
    return {
      startStyle: {
        width: `${divider}px`
      },
      dragging
    };
  }

  // implement drag-drop handlers to support resizing the image grid.
  doDown(e) {
    e.stopPropagation();
    document.body.style.cursor = 'ew-resize';
    // this.state.imageGridWidth = this.state.imageGrid.offsetWidth;
    document.addEventListener('pointerup', this.upListener);
    this.mergeState({dragging: true, dividerStart: this.state.divider});
  }

  doMove(dx, dy) {
    const divider = this.state.dividerStart + dx;
    this.mergeState({divider});
    //const newWidth = DragDrop.grid(this.state.imageGridWidth + dx, 8);
    //this.state.imageGrid.style.width = `${Math.max(newWidth, 8)}px`;
  }
}
customElements.define('split-panel', SplitPanel);
