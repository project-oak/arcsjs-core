/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Xen} from './Xen/xen-async.js';

/**
 * originally intended to provide custom (non-DOM) dragging operations
 * mostly used for resizing, dragging, panning, and so on
 */
export const DragDrop = class extends Xen.Async {
  onDown(e) {
    if (this.doDown(e) !== false) {
      this.dragging = true;
      window.onmousemove = this.onMove.bind(this);
      window.onmouseup = this.onUp.bind(this);
      const {pageX, pageY} = e;
      const [x, y] = [pageX, pageY].map(Math.round);
      this.dragStart = {x, y};
    } else {
      this.dragging = false;
    }
  }
  onMove(e) {
    // TODO(sjmiles): optional?
    //e.preventDefault();
    if (!e.buttons) {
      this.onUp(e);
    } else if (this.dragging) {
      e.preventDefault();
      const {x, y} = this.dragStart;
      const {pageX, pageY} = e;
      const [dx, dy] = [pageX-x, pageY-y];
      this.doMove(dx, dy, pageX, pageY, x, y);
    }
  }
  onUp(e) {
    this.dragging = false;
    window.onmousemove = null;
    window.onmouseup = null;
    this.doUp();
  }
  static grid(o, size) {
    return Math.round(o / size) * size;
  }
  static snap(rect, size) {
    if (rect) {
      ['l', 't', 'w', 'h'].forEach(o => rect[o] = DragDrop.grid(rect[o], size));
    }
    return rect;
  }
  doDown(e) {
  }
  doMove(dx, dy, sx, sy, x0, y0) {
  }
  doDrag({l, t, w, h}, dx, dy, dragKind, dragFrom) {
  }
  doUp() {
  }
};
