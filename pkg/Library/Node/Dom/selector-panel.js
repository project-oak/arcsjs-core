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
      'selected',
    ];
  }
  _didMount() {
    this.boxer = this._dom.$('[boxer]');
    this.resizeObserver = new ResizeObserver((entries) => {
      this.invalidate();
    });
    this.resizeObserver.observe(this);
    // TODO(sjmiles): need simple 'focus' somewhere, put keydown there, perhaps on `this`
    //document.addEventListener('keydown', event => this.onKeydown(event));
  }
  update({selected}) {
    log('update', {selected});
    this.selectAll(selected);
  }
  selectAll(ids) {
    ids?.forEach(id => {
      const elt = this.getAssignedElementId(id);
      if (elt) {
        this.updateSelectionBox(elt);
      }
    });
  }
  getAssignedElementId(id) {
    const sid = this.sanitizeId(id);
    const selector = `[id^="${sid}"]`;
    const elts = this.shadowRoot.querySelector('slot').assignedElements({flatten: true});
    let child = elts.find(elt => elt.matches(selector));
    if (!child) {
      elts.some(elt => child = elt.querySelector(selector));
    }
    log(child, sid, elts);
    return child;
    //return this.querySelector(`[id=${this.sanitizeId(id)}]`);
  }
  sanitizeId(id) {
    return id?.replace(/[)(:]/g, '_');
  }
  updateSelectionBox(target) {
    this.setBoxStyle(this.boxer, this.getTargetRect(target));
    this.boxer.hidden = false;
  }
  getTargetRect(target) {
    const pRect = this.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const [l, t, w, h] = [tRect.left - pRect.left, tRect.top - pRect.top, tRect.width, tRect.height];
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
  render({color, statical}) {
    const styleOverrides = `
      [edge] {
        border-color: ${color}
      }
      [corner] {
        border-color: ${color}
      }
    `;
    return {
      //statical,
      styleOverrides
    };
  }
  // implement drag-drop handlers
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
  // restyleSelection() {
  //   this.boxer.hidden = (this.disabled != null) || !this.target;
  //   if (this.target) {
  //     const {l, t, w, h} = this.getRect(this.target);
  //     const rect = {l, t, w, h};
  //     //const rect = {l: l+4, t: t+4, w: w-8, h: h-8};
  //     this.setBoxStyle(this.boxer, rect);
  //   }
  // }
  get template() {
    return Xen.Template.html`
<style>
  ${IconsCss}
  :host {
    position: relative;
    flex: 1;
    display: flex;
    user-select: none;
    background-image: radial-gradient(#2121210A 15%, transparent 15%);
    background-position: -8px -8px, 0 0;
    background-size: 16px 16px;
    /* handles */
    --size: 9px;
    /* --center: -7px;
    --offset: 0px; */
  }
  * {
    box-sizing: border-box;
  }
  [container] {
    flex: 1;
    /* position: absolute;
    inset: 0; */
    display: flex;
    flex-direction: column;
  }
  /* ::slotted(*) {
    outline: 1px dotted lightblue !important;
  } */
  /* slot:not([statical])::slotted(*) {
    position: absolute;
  } */
  [boxer] {
    pointer-events: none;
    position: absolute;
    background-color: transparent;
    box-sizing: border-box;
    /* padding: 2px; */
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
    /* border: 1px solid #6200EE80; */
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
<style>${'{{styleOverrides}}'}</style>

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
