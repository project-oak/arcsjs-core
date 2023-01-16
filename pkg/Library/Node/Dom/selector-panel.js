/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Xen} from '../../Dom/Xen/xen-async.js';
import {DragDrop} from '../../Dom/drag-drop.js';
import {IconsCss} from '../../Dom/Material/material-icon-font/icons.css.js';
import {logFactory} from '../../Core/utils.js';

const log = logFactory(logFactory.flags.designer, 'selector-panel', '#8B8000', '#333');
const {assign} = Object;

export class SelectorPanel extends DragDrop {
  static get observedAttributes() {
    return [
      // 'disabled',
      'selected'
    ];
  }
  _didMount() {
    this.boxer = this._dom.$('[boxer]');
    this.resizeObserver = new ResizeObserver((entries) => this.invalidate());
    // TODO(sjmiles): need simple 'focus' somewhere, put keydown there, perhaps on `this`
    //document.addEventListener('keydown', event => this.onKeydown(event));
  }
  update({selected}) {
    this.selectAll(selected);
  }
  render({color, statical}) {
    // const styleOverrides = `
    //   [edge] {
    //     border-color: ${color}
    //   }
    //   [corner] {
    //     border-color: ${color}
    //   }
    // `;
    return {
      //statical,
      // styleOverrides
    };
  }
  doDown(e) {
    let t = e.target;
    const nodeId = t.id.split('_').shift();
    if (nodeId) {
      while (t.parentElement.id.startsWith(nodeId)) {
        t = t.parentElement;
      }
      this.updateSelectionBox(t);
      this.value = nodeId;
      this.fire('select');
    }
  }
  selectAll(ids) {
    let observe = null;
    ids?.forEach(id => {
      const elt = this.querySlotById(id);
      if (elt) {
        this.updateSelectionBox(elt);
        observe = elt;
      }
    });
    if (this.lastObserved !== observe) {
      //log('obs', observe);
      if (this.lastObserved) {
        this.resizeObserver.unobserve(this.lastObserved);
      }
      if (observe) {
        this.resizeObserver.observe(observe);
      }
      this.lastObserved = observe;
    }
  }
  updateSelectionBox(target) {
    this.setBoxStyle(this.boxer, this.getTargetRect(target));
    this.boxer.hidden = false;
  }
  querySlotById(id) {
    const sid = this.sanitizeId(id);
    const selector = `[id^="${sid}"]`;
    const elts = this.shadowRoot.querySelector('slot').assignedElements({flatten: true});
    // any assigned elements of the slot match directly?
    let child = elts.find(elt => elt.matches(selector));
    if (!child) {
      // if not, look in the subtree of each assigned element
      elts.some(elt => child = elt.querySelector(selector));
    }
    //log(child, sid, elts);
    return child;
  }
  sanitizeId(id) {
    return id?.replace(/[)(:]/g, '_');
  }
  getTargetRect(target) {
    // (local) ancestor frame in BoundingSpace
    const aRect = this.getBoundingClientRect();
    // target frame in BoundingSpace
    const tRect = target.getBoundingClientRect();
    // calculate the rect of target in local frame
    const [l, t, w, h] = [tRect.left - aRect.left, tRect.top - aRect.top, tRect.width, tRect.height];
    return {l, t, w, h};
  }
  setBoxStyle(elt, {l, t, w, h}) {
    assign(elt.style, {
      transform: `translate(${l}px, ${t}px)`,
      width: `${!(w>0) ? 64 : w}px`,
      height: `${!(h>0) ? 64 : h}px`,
      display: `${w <=0 || h <=0 ? 'none' : ''}`
    });
  }
  get template() {
    return Xen.Template.html`
<style>
  ${IconsCss}
  :host {
    /* outside */
    position: relative;
    flex: 1;
    /* inside */
    display: flex;
    user-select: none;
    /* graph paper */
    background-image: radial-gradient(#2121210A 15%, transparent 15%);
    background-position: -8px -8px, 0 0;
    background-size: 16px 16px;
    /* handles */
    --size: 9px;
  }
  * {
    box-sizing: border-box;
  }
  [container] {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  [boxer] {
    pointer-events: none;
    position: absolute;
    background-color: transparent;
    box-sizing: border-box;
    transform: translate(-1000px, 0);
    z-index: 100;
  }
  [corner] {
    pointer-events: all;
    position: absolute;
    width: var(--size);
    height: var(--size);
    border: 2px solid #48809A;
    background-color: white;
  }
  [left][corner] {
    left: 0;
  }
  [right] {
    right: 0;
  }
  [top][corner] {
    top: 0;
  }
  [bottom] {
    bottom: 0;
  }
  [top][left], [bottom][right] {
    cursor: nwse-resize;
  }
  [bottom][left], [top][right] {
    cursor: nesw-resize;
  }
  [edge] {
    pointer-events: all;
    position: absolute;
    background-color: #6200EE80
  }
  [top][edge], [bottom][edge] {
    left: 0;
    right: 0;
    height: 2px;
    cursor: ns-resize;
  }
  [left][edge], [right][edge] {
    top: 0;
    bottom: 0;
    width: 2px;
    cursor: ew-resize;
  }
</style>
<!-- <style>${'{{styleOverrides}}'}</style> -->

<div container on-pointerdown="onDown">
  <slot on-pointerdown="onDown" on-pointerup="onUp" on-slotchange="onSlotChange"></slot>
</div>

<div boxer on-pointerdown="onDown">
  <div top edge></div>
  <div right edge></div>
  <div bottom edge></div>
  <div left edge></div>
  <div top right corner></div>
  <div bottom right corner></div>
  <div bottom left corner></div>
  <div top left corner></div>
</div>
`;
  }
}

customElements.define('selector-panel', SelectorPanel);
