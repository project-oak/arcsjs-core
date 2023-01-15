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

const log = logFactory(logFactory.flags['designer-layout'] || true, 'designer-layout', '#8B8000', '#333');

const {assign} = Object;

const GRID_SIZE = 8;

export class DesignerLayout extends DragDrop {
  static get observedAttributes() {
    return [
      'statical',
      'disabled',
      'selected',
      'rects',
      'color',
      'kick'
    ];
  }
  _didMount() {
    this.boxer = this._dom.$('[boxer]');
    // TODO(sjmiles): need simple 'focus' somewhere, put keydown there, perhaps on `this`
    //document.addEventListener('keydown', event => this.onKeydown(event));
    // new objects should be checked for rational geometry
    // TODO(sjmiles): this simply does not work, it is unexplained
    this.observer = new MutationObserver(() => {
      //console.warn('mutationObserver has observed!');
      this.updateGeometry();
    });
    this.observer.observe(this, {childList: true});
  }
  _setValueFromAttribute(name, value) {
    // hook for type coercion (attributes are always String valued,
    // or null; Boolean values are often ''/null).
    this[name] = (name === 'statical') ? (typeof value === 'string') : value;
  }
  update() {
    this.updateGeometry();
  }
  updateGeometry() {
    this.select(null);
    if (!this.dragging) {
      const map = {};
      this.rects?.forEach(r => {
        const id = this.sanitizeId(r.id);
        if (id !== 'id') {
          const elt = this.querySelector(`[id^="${id}"]`);
          if (elt) {
            map[elt.id] = r;
          }
        }
        //map[this.sanitizeId(r.id)] = r
      });
      for (const child of this.children) {
        const rect = map[child.id]?.position || {l: 64, t: 64, w: 240, h: 180};
        this.position(child.id, rect);
      }
    }
    this.selectAll(this.selected);
  }
  position(id, position) {
    if (!this.statical) {
      const child = this.getChildById(id);
      if (child) {
        const defaultPosition = {l: 64, t: 64, w: 240, h: 180};
        this.setBoxStyle(child, position ?? defaultPosition);
      }
    }
  }
  getChildById(id) {
    return this.querySelector(`[id=${this.sanitizeId(id)}]`);
  }
  sanitizeId(id) {
    return id?.replace(/[)(:]/g, '_');
  }
  // onKeydown(event) {
  //   if (!this.hasActiveInput()) {
  //     // Delete the selected node or edge when pressing the "backspace" or "delete" key .
  //     if (event.key === 'Backspace' || event.key === 'Delete') {
  //       this.deleteAction(this.target);
  //     }
  //   }
  // }
  // hasActiveInput() {
  //   const active = this.getActiveElement(document);
  //   return active?.contentEditable
  //     || ['input', 'select', 'textarea'].includes(active?.localName)
  //     ;
  // }
  // getActiveElement({activeElement}) {
  //   return activeElement?.shadowRoot ? this.getActiveElement(activeElement.shadowRoot) : activeElement;
  // }
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
      statical,
      //styleOverrides
    };
  }
  /**/
  getTargetKey(target) {
    return target?.getAttribute('id');
  }
  deleteAction(target) {
    if (target) {
      this.key = this.getTargetKey(target);
      this.fire('delete');
    }
  }
  // onSlotChange() {
  //   //console.log('slot change');
  //   this.updateGeometry();
  // }
  select(id) {
    this.lastSelectedId = id;
    this.selectChild(this.getChildById(id), id);
  }
  selectAll(ids) {
    ids?.forEach(id => {
      const child = this.getChildById(id);
      if (child) {
        this.selectChild(child, id);
      }
    });
  }
  selectChild(child, id) {
  //   this.selectFromTarget(child);
  // //   this.target = child;
  // //   // TODO(mariakleiner): it is possible that the `target` hasn't rendered yet and will remain unselected.
  // //   this.rect = this.target && this.getRect(this.target);
  // //   this.restyleSelection();
  // //   this.updateOrders(this.target);
  }
  // firePosition(target) {
  //   this.key = this.getTargetKey(target);
  //   this.value = null;
  //   if (target) {
  //     const {l, t, w, h} = this.getRect(target);
  //     this.value = {l, t, w, h};
  //   }
  //   this.fire('position');
  // }
  // updateOrders(target) {
  //   //const particleDivs = this.querySelectorAll('[particle]');
  //   const particleDivs = this.querySelectorAll('[id]');
  //   particleDivs.forEach(div => {
  //     if (!this.rects?.find(rect => rect.id === div.id)) {
  //       div.style.zIndex = 98;
  //     } else {
  //       div.style.zIndex = (div === target ? 100 : 99);
  //     }
  //   });
  // }
  /**/
  // onContainerDown(e) {
  //   // deselect when clicking empty background
  //   this.select(null);
  //   this.firePosition(null);
  // }
  //
  selectFromTarget(target) {
    // find first in family line with an 'id'
    while (target && !target.id) {
      target = target.parentElement;
    }
    // zoom out from 'container' to 'particle'
    const nodeId = target?.id.split('_').shift();
    // found something?
    if (nodeId) {
      // zoom out from 'particle' to 'node'
      while (target.parentElement?.id?.startsWith(nodeId)) {
        target = target.parentElement;
      }
      // get descendent client rect in our frame of reference
      const tRect = target.getBoundingClientRect();
      const pRect = this.getBoundingClientRect();
      const [l, t, w, h] = [tRect.left - pRect.left, tRect.top - pRect.top, tRect.width, tRect.height];
      const rect = {l, t, w, h};
      // validated target and rectangles
      this.target = target;
      this.rect = this.dragRect = rect;
      // display selection box
      this.setBoxStyle(this.boxer, rect);
      this.boxer.hidden = false;
    }
  }
  // implement drag-drop handlers
  doDown(e) {
    this.selectFromTarget(e.target);
    // //
    // if (this.target) {
    //   // dom target
    //   const attrs = e.target.attributes;
    //   const edges = ['top', 'right', 'bottom', 'left'];
    //   const from = edges.map(e => attrs[e]?.name).join(':');
    //   if (from === ':::') {
    //     // not on the box itself
    //     if (!e.ctrlKey && !e.metaKey) {
    //       const top = e.path?.[0];
    //       if (top?.hasAttribute?.('nodrag')) {
    //         return;
    //       }
    //       if (['input', 'button', 'textarea'].includes(top?.localName)) {
    //         return;
    //       }
    //     }
    //     // component target
    //     this.dragKind = 'move';
    //   } else {
    //     // resize target
    //     this.dragKind = 'resize';
    //     this.dragFrom = from;
    //   }
    //   e.stopPropagation();
    // }
    //
    // this.rect = this.target && this.getRect(this.target);
    // this.dragRect = this.rect;
    // this.dragStarted = false;
    //
    // this.restyleSelection();
    // this.updateOrders(this.target);
    // // This is to select the node right away when pointer is down.
    // this.firePosition(this.target);
  }
  // doMove(dx, dy) {
  //   if (this.dragRect && this.target && !this.statical) {
  //     // grid-snap
  //     const snap = rect => rect; //DragDrop.snap(rect, GRID_SIZE);
  //     // perform drag operation
  //     this.dragStarted = true;
  //     const dragRect = this.doDrag(this.dragRect, dx, dy, this.dragKind, this.dragFrom);
  //     //const dragRect = this.doDrag(snap(this.dragRect), dx, dy, this.dragKind, this.dragFrom);
  //     // install output rectangle
  //     this.setBoxStyle(this.target, snap(dragRect));
  //     // let the boxer adapt to the target end state
  //     requestAnimationFrame(() => this.target && this.setBoxStyle(this.boxer, this.getRect(this.target)));
  //     this.value = dragRect;
  //     //log('fire update-box', this.target.id, this.value);
  //     //this.fire('update-box');
  //   }
  // }
  // doDrag({l, t, w, h}, dx, dy, dragKind, dragFrom) {
  //   if (dragKind === 'move') {
  //     return {l: l+dx, t: t+dy, w, h};
  //   } else if (dragKind === 'resize') {
  //     if (dragFrom.includes('top')) {
  //       t = t+dy;
  //       h = h-dy;
  //     }
  //     if (dragFrom.includes('bottom')) {
  //       h = h+dy;
  //     }
  //     if (dragFrom.includes('left')) {
  //       l = l+dx;
  //       w = w-dx;
  //     }
  //     if (dragFrom.includes('right')) {
  //       w = w+dx;
  //     }
  //   }
  //   return {l, t, w, h};
  // }
  // doUp() {
  //   this.dragRect = null;
  //   if (this.target && this.dragStarted) {
  //     this.dragStarted = false;
  //     //log('drag terminated');
  //     //setTimeout(() => {
  //       //log('fire update-box', this.target.id);
  //       this.fire('update-box');
  //       //log('firePosition', this.target.id);
  //       this.firePosition(this.target);
  //     //}, 100);
  //   }
  // }
  //
  // getEventTarget(e) {
  //   const p = e.composedPath();
  //   const i = p.indexOf(e.currentTarget);
  //   return p[i-1];
  // }
  // getRect(elt) {
  //   const local = elt.getBoundingClientRect();
  //   // it's possible elt has lost it's parent (temporarily)
  //   const parentRect = elt.offsetParent?.getBoundingClientRect() ?? {x: 0, y: 0};
  //   const scrollTop = elt.offsetParent?.scrollTop || 0;
  //   const scrollLeft = elt.offsetParent?.scrollLeft || 0;
  //   return {
  //     l: local.x - parentRect.x + scrollLeft,
  //     t: local.y - parentRect.y + scrollTop,
  //     w: local.width, h: local.height
  //   };
  // }
  setBoxStyle(elt, {l, t, w, h}) {
    assign(elt.style, {
      transform: `translate(${l}px, ${t}px)`,
      width: `${!(w>0) ? 64 : w}px`,
      height: `${!(h>0) ? 64 : h}px`,
      display: `${w <=0 || h <=0 ? 'none' : ''}`
    });
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
    user-select: none;
    position: relative;
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
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
  }
  /* ::slotted(*) {
    outline: 1px dotted lightblue !important;
  } */
  slot:not([statical])::slotted(*) {
    position: absolute;
  }
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
  <slot statical$="{{statical}}" on-pointerdown="onDown" on-pointerup="onUp" on-slotchange="onSlotChange"></slot>
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
