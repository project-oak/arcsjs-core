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
    --resizer-size: 11px;
    --handle-size: 16px;
    display: flex;
    background-color: var(--theme-color-bg-4);
  }
  [resizer] {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }
  [resizer]:not([vertical]) {
    height: var(--resizer-size);
    cursor: ns-resize;
  }
  [vertical][resizer] {
    width: var(--resizer-size);
    cursor: ew-resize;
  }
  [resizer]:hover, [resizer][dragging] {
    background-color: #e6e6e6;
  }
  [handle] {
    background-color: #ccc;
    border: 1px solid #eeeeee;
    border-radius: 4px;
  }
  [handle]:not([vertical]) {
    width: var(--handle-size);
    height: 40%;
  }
  [handle][vertical] {
    width: 40%;
    height: var(--handle-size);
  }
  [startside] {
    min-height: 16px;
    min-width: 16px;
  }
  [startside], [endside] {
    display: flex;
    flex-direction: column;
  }
  [flex] {
    flex: 1;
    flex-basis: 0px;
    overflow: hidden;
  }
</style>

<div startside flex>
  <slot name="one"></slot>
  <slot name="left"></slot>
  <slot name="top"></slot>
</div>
<div resizer vertical$="{{vertical}}" dragging$="{{dragging}}" on-pointerdown="onDown">
  <div handle vertical$="{{vertical}}" ></div>
</div>
<div endside xen:style="{{endStyle}}">
  <slot name="two"></slot>
  <slot name="right"></slot>
  <slot name="bottom"></slot>
</div>

`;

export class SplitPanel extends DragDrop {
  static get observedAttributes() {
    return ['divider', 'vertical'];
  }
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
  update({divider, vertical}, state) {
    divider = isNaN(Number(divider)) ? null : Number(divider);
    // attributes are "" for true, null for false
    vertical = (vertical != null);
    if (!state.divider) {
      // which direction are we splitting
      const ord = vertical ? 'offsetWidth' : 'offsetHeight';
      // the total length in that direction
      const ordValue = this[ord];
      // 'divider' < 0 means to measure from the other end
      if (divider < 0) {
        divider = Math.max(16, ordValue + divider);
      }
      // use divider, or have the length for the split-point
      const d = divider || Math.floor(ordValue/2);
      // cache clamped divider (should be normalized float?)
      state.divider = Math.max(d, 16);
      state.vertical = vertical;
    }
  }
  render({}, {vertical, divider, dragging}) {
    const ord = vertical ? 'width' : 'height';
    return {
      endStyle: {
        [ord]: `${divider}px`
      },
      vertical,
      dragging
    };
  }
  doDown(e) {
    e.stopPropagation();
    document.body.style.cursor = this.state.vertical ? 'ew-resize' : 'ns-resize';
    window.addEventListener('pointerup', this.upListener);
    this.mergeState({
      dragging: true,
      dividerStart: this.state.divider
    });
  }
  doMove(dx, dy, sx, sy) {
    //console.log(this.state.dividerStart, sy, dy);
    const d = this.state.vertical ? dx : dy;
    this.mergeState({
      divider: Math.round(this.state.dividerStart - d)
    });
  }
}
customElements.define('split-panel', SplitPanel);
