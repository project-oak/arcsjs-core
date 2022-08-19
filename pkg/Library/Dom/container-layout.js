/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Xen} from './Xen/xen-async.js';
import {DragDrop} from './drag-drop.js';
import {IconsCss} from './Material/material-icon-font/icons.css.js';

const {assign} = Object;

export class ContainerLayout extends DragDrop {
  static get observedAttributes() {
    return [
      'selected', 'rects',
      // The color of the boxer.
      'color'
    ];
  }
  _didMount() {
    this.boxer = this._dom.$('[boxer]');
    this.setupKeyboardShortcut();
  }
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (event) => {
      // Don't trigger if any input elements have the focus.
      const activeEle = this.getActiveElement(document);
      const isInputElement = activeEle.tagName === 'INPUT' ||
          activeEle.tagName === 'SELECT' || activeEle.tagName === 'TEXTAREA' ||
          activeEle.contentEditable === 'true';
      if (isInputElement) {
        return;
      }

      // Delete the selected node or edge when pressing the "backspace" or "delete" key .
      if (event.key === 'Backspace' || event.key === 'Delete') {
        if (this.target) {
          this.key = this.target.id;
          this.fire('delete');
        }
      }
    });
  }
  getActiveElement(root) {
    const activeEl = root.activeElement;

    if (!activeEl) {
      return null;
    }

    if (activeEl.shadowRoot) {
      return this.getActiveElement(activeEl.shadowRoot);
    } else {
      return activeEl;
    }
  }
  update({selected, rects}, state) {
    const selectedJson = JSON.stringify(selected);
    const rectsJson = JSON.stringify(rects);
    if (state.selectedJson !== selectedJson || rectsJson !== rectsJson) {
      state.selectedJson = selectedJson;
      state.rectsJson = rectsJson;

      setTimeout(() => {
        this.updateSelectionAndPositions(selected, rects);
      }, 100);
    }
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
  updateSelectionAndPositions(selected, rects) {
    rects?.forEach(({id, position}) => this.position(id, position));
    this.select(null);
    selected.forEach(id => {
      if (this.getChildById(id)) {
        this.select(id);
      }
    });
  }
  position(id, position) {
    if (position == null) {
      // Set initial position to (16, 16);
      const target = this.getChildById(id);
      const rect = target && this.getRect(target);
      if (rect) {
        rect.t = 16;
        rect.l = 16;
        this.setBoxStyle(target, rect);
        this.firePosition(target);
      }
    } else {
      const child = this.getChildById(id);
      if (child && position) {
        this.setBoxStyle(child, position);
      }
    }
  }
  select(id) {
    this.target = this.getChildById(id);
    // TODO(mariakleiner): it is possible that the `target` hasn't rendered yet and will remain unselected.
    this.rect = this.target && this.getRect(this.target);
    this.restyleSelection();
    this.updateOrders(this.target);
  }
  firePosition(target) {
    this.key = target?.id;
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
      div.style.zIndex = (div === target ? 100 : 99);
    });
  }
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
  }
  doMove(dx, dy) {
    // grid-snap
    const snap = rect => DragDrop.snap(rect, 16);
    // perform drag operation
    const dragRect = this.doDrag(snap(this.rect), dx, dy, this.dragKind, this.dragFrom);
    // install output rectangle
    this.setBoxStyle(this.target, snap(dragRect));
    requestAnimationFrame(() => this.setBoxStyle(this.boxer, this.getRect(this.target)));
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
    if (this.target) {
      this.firePosition(this.target);
    }
  }
  //
  getChildById(id) {
    return this.querySelector(`#${id}`);
  }
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
      width: `${!(w>0) ? 0 : w}px`,
      height: `${!(h>0) ? 0 : h}px`
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
  ::slotted(*) {
    position: absolute;
  }
  [container] {
    flex: 1;
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
<style>{{styleOverrides}}</style>
<div container on-pointerdown="onContainerDown">
  <slot on-pointerdown="onDown" on-pointerup="onUp"></slot>
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
</div>`;
  }
}

customElements.define('container-layout', ContainerLayout);