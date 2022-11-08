/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Xen} from '../Dom/Xen/xen-async.js';
import {DragDrop} from '../Dom/drag-drop.js';
import {IconsCss} from '../Dom/Material/material-icon-font/icons.css.js';

const {assign} = Object;

const GRID_SIZE = 8;

export class DesignerLayout extends DragDrop {
  static get observedAttributes() {
    return [
      'selected',
      'rects',
      'color'
    ];
  }
  _didMount() {
    this.boxer = this._dom.$('[boxer]');
    // TODO(sjmiles): need simple 'focus' somewhere, put keydown there, perhaps on `this`
    document.addEventListener('keydown', event => this.onKeydown(event));
  }
  update() {
    this.updateGeometry();
  }
  updateGeometry() {
    if (!this.dragging) {
      this.select(null);
      const map = {};
      this.rects?.forEach(r => map[this.sanitizeId(r.id)] = r);
      for (const child of this.children) {
        const rect = map[child.id]?.position || {l: 64, t: 64, w: 240, h: 180};
        this.position(child.id, rect);
      }
      this.selectAll(this.selected);
    }
  }
  position(id, position) {
    const child = this.getChildById(id);
    if (child) {
      const defaultPosition = {l: 64, t: 64, w: 240, h: 180};
      this.setBoxStyle(child, position ?? defaultPosition);
    }
  }
  getChildById(id) {
    return this.querySelector(`#${this.sanitizeId(id)}`);
  }
  sanitizeId(id) {
    return id?.replace(/[)(:]/g, '_');
  }
  onKeydown(event) {
    if (!this.hasActiveInput()) {
      // Delete the selected node or edge when pressing the "backspace" or "delete" key .
      if (event.key === 'Backspace' || event.key === 'Delete') {
        this.deleteAction(this.target);
      }
    }
  }
  hasActiveInput() {
    const active = this.getActiveElement(document);
    return active?.contentEditable
      || ['INPUT', 'SELECT', 'TEXTAREA'].includes(active?.tagName)
      ;
  }
  getActiveElement({activeElement}) {
    return activeElement?.shadowRoot ? this.getActiveElement(activeElement.shadowRoot) : activeElement;
  }
  render({color}) {
    const styleOverrides = `
      [edge] {
        border-color: ${color}
      }
      [corner] {
        border-color: ${color}
      }
    `;
    return {
      styleOverrides
    };
  }
  getTargetKey(target) {
    return target?.getAttribute('particle');
  }
  /**/
  deleteAction(target) {
    if (target) {
      this.key = this.getTargetKey(target);
      this.fire('delete');
    }
  }
  onSlotChange() {
    //console.log('slot change');
    this.updateGeometry();
  }
  select(id) {
    this.lastSelectedId = id;
    this.selectChild(this.getChildById(id), id);
  }
  selectChild(child, id) {
    this.target = child;
    // TODO(mariakleiner): it is possible that the `target` hasn't rendered yet and will remain unselected.
    this.rect = this.target && this.getRect(this.target);
    this.restyleSelection();
    this.updateOrders(this.target);
  }
  selectAll(ids) {
    ids?.forEach(id => {
      const child = this.getChildById(id);
      if (child) {
        this.selectChild(child, id);
      }
    });
  }
  firePosition(target) {
    this.key = this.getTargetKey(target);
    this.value = null;
    if (target) {
      const {l, t, w, h} = this.getRect(target);
      this.value = {l, t, w, h};
    }
    this.fire('position');
  }
  updateOrders(target) {
    const particleDivs = this.querySelectorAll('[particle]');
    particleDivs.forEach(div => {
      if (!this.rects?.find(rect => rect.id === div.id)) {
        div.style.zIndex = 98;
      } else {
        div.style.zIndex = (div === target ? 100 : 99);
      }
    });
  }
  /**/
  // deselect when clicking empty backgroud
  onContainerDown(e) {
    this.select(null);
    this.firePosition(null);
  }
  //
  // implement drag-drop handlers
  doDown(e) {
    e.stopPropagation();
    // dom target
    const attrs = e.target.attributes;
    const edges = ['top', 'right', 'bottom', 'left'];
    const from = edges.map(e => attrs[e]?.name).join(':');
    if (from === ':::') {
      if (['input', 'button', 'textarea'].includes(e.path?.[0]?.localName)) {
        return;
      }
      // component target
      this.dragKind = 'move';
      this.target = this.getEventTarget(e);
    } else {
      // resize target
      this.dragKind = 'resize';
      this.dragFrom = from;
    }
    this.rect = this.target && this.getRect(this.target);
    this.restyleSelection();
    this.updateOrders(this.target);
    // This is to select the node right away when pointer is down.
    this.firePosition(this.target);
    this.dragRect = this.rect;
    // TODO(sjmiles): hack to allow dragging only from title bar
    // if (from === ':::') {
    //   const t0 = e.composedPath?.()?.[0];
    //   //console.log(t0 && t0.attributes.title);
    //   if (t0 && !t0.attributes.title) {
    //     return false;
    //   }
    // }
  }
  doMove(dx, dy) {
    if (this.dragRect && this.target) {
      // grid-snap
      const snap = rect => DragDrop.snap(rect, GRID_SIZE);
      // perform drag operation
      const dragRect = this.doDrag(this.dragRect, dx, dy, this.dragKind, this.dragFrom);
      //const dragRect = this.doDrag(snap(this.dragRect), dx, dy, this.dragKind, this.dragFrom);
      // install output rectangle
      this.setBoxStyle(this.target, snap(dragRect));
      // let the boxer adapt to the target end state
      requestAnimationFrame(() => this.target && this.setBoxStyle(this.boxer, this.getRect(this.target)));
      this.value = dragRect;
      this.fire('update-box');
    }
  }
  doDrag({l, t, w, h}, dx, dy, dragKind, dragFrom) {
    if (dragKind === 'move') {
      return {l: l+dx, t: t+dy, w, h};
    } else if (dragKind === 'resize') {
      if (dragFrom.includes('top')) {
        t = t+dy;
        h = h-dy;
      }
      if (dragFrom.includes('bottom')) {
        h = h+dy;
      }
      if (dragFrom.includes('left')) {
        l = l+dx;
        w = w-dx;
      }
      if (dragFrom.includes('right')) {
        w = w+dx;
      }
    }
    return {l, t, w, h};
  }
  doUp() {
    this.dragRect = null;
    if (this.target) {
      setTimeout(() => {
        this.fire('update-box');
        this.firePosition(this.target);
      }, 100);
    }
  }
  //
  getEventTarget(e) {
    const p = e.composedPath();
    const i = p.indexOf(e.currentTarget);
    return p[i-1];
  }
  getRect(elt) {
    const local = elt.getBoundingClientRect();
    // it's possible elt has lost it's parent (temporarily)
    const parentRect = elt.offsetParent?.getBoundingClientRect() ?? {x: 0, y: 0};
    const scrollTop = elt.offsetParent?.scrollTop || 0;
    const scrollLeft = elt.offsetParent?.scrollLeft || 0;
    return {
      l: local.x - parentRect.x + scrollLeft,
      t: local.y - parentRect.y + scrollTop,
      w: local.width, h: local.height
    };
  }
  setBoxStyle(elt, {l, t, w, h}) {
    assign(elt.style, {
      transform: `translate(${l}px, ${t}px)`,
      width: `${!(w>0) ? 64 : w}px`,
      height: `${!(h>0) ? 64 : h}px`
    });
  }
  restyleSelection() {
    this.boxer.hidden = !this.target;
    if (this.target) {
      this.setBoxStyle(this.boxer, this.getRect(this.target));
    }
  }
  get template() {
    return Xen.Template.html`
<style>
  ${IconsCss}
  :host {
    user-select: none;
    position: relative;
    background-image: radial-gradient(#2121210A 15%, transparent 15%);
    background-position: -8px -8px, 0 0;
    background-size: 16px 16px;
    /* handles */
    --size: 9px;
    --center: -7px;
    --offset: -4px;
  }
  * {
    box-sizing: border-box;
  }
  [container] {
    position: absolute;
    inset: 0;
  }
  ::slotted(*) {
    position: absolute;
    outline: 1px dotted lightblue !important;
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
  [top] {
    top: var(--center);
  }
  [bottom] {
    bottom: var(--center);
  }
  [left] {
    left: var(--center);
  }
  [right] {
    right: var(--center);
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
    border: 2px solid lightblue;
  }
  [top][edge], [bottom][edge] {
    left: var(--offset);
    right: var(--offset);
    height: 1px;
  }
  [left][edge], [right][edge] {
    top: var(--offset);
    bottom: var(--offset);
    width: 1px;
  }
  [top][edge] {
    top: var(--offset);
    cursor: ns-resize;
  }
  [bottom][edge] {
    bottom: var(--offset);
    cursor: ns-resize;
  }
  [left][edge] {
    left: var(--offset);
    cursor: ew-resize;
  }
  [right][edge] {
    right: var(--offset);
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

customElements.define('designer-layout', DesignerLayout);
