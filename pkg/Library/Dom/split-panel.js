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
    flex-direction: column;
  }
  [resizer] {
    border-top: 1px solid #ffffff;
    border-bottom: 1px solid #e6e6e6;
    /*
    width: 7px;
    cursor: ew-resize;
    */
    height: 7px;
    cursor: ns-resize;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  [resizer]:hover,
  [resizer][dragging] {
    background-color: #e6e6e6;
  }
  [handle] {
    width: 12px;
    height: 2px;
    /* width: 2px;
    height: 12px; */
    background-color: #ccc;
    border: 1px solid white;
  }
  [startside] {
    min-height: 16px;
    /* min-width: 16px; */
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

<div startside xen:style="{{startStyle}}" frame="startside">
  <slot name="startside"></slot>
</div>
<div resizer dragging$="{{dragging}}" on-pointerdown="onDown">
  <div handle></div>
</div>
<div endside flex frame="endside">
  <slot name="endside"></slot>
</div>

`;

export class SplitPanel extends DragDrop {
  static get observedAttributes() {
    return ['divider'];
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
    const ss = this._dom.$('[startside]');
    ss.setAttribute('flex', '');
    setTimeout(() => {
      //this.mergeState({divider: ss.offsetWidth});
      this.mergeState({divider: ss.offsetHeight});
      ss.removeAttribute('flex');
    }, 10);
  }

  // update({divider}, state) {
  //   if (!state.divider && d) {
  //     state.divider = divider || 120;
  //   }
  // }

  render({}, {divider, dragging}) {
    return {
      startStyle: {
        height: `${divider}px`
        // width: `${divider}px`
      },
      dragging
    };
  }

  // implement drag-drop handlers to support resizing the image grid.
  doDown(e) {
    e.stopPropagation();
    document.body.style.cursor = 'ns-resize';
    //document.body.style.cursor = 'ew-resize';
    window.addEventListener('pointerup', this.upListener);
    this.mergeState({
      dragging: true,
      dividerStart: this.state.divider
    });
  }

  doMove(dx, dy) {
    //const d = dx;
    const d = dy;
    this.mergeState({
      divider: Math.round(this.state.dividerStart + d)
    });
  }
}
customElements.define('split-panel', SplitPanel);
