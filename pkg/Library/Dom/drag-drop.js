/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {Xen} from './Xen/xen-async.js';

export const DragDrop = class extends Xen.Async {
  onDown(e) {
    const {screenX: x, screenY: y} = e;
    if (this.doDown(e) !== false) {
      this.dragging = true;
      this.dragStart = {x, y};
      window.onmousemove = this.onMove.bind(this);
      window.onmouseup = this.onUp.bind(this);
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
      const {screenX: sx, screenY: sy} = e;
      const {x:x0, y:y0} = this.dragStart;
      const [dx, dy] = [sx-x0, sy-y0];
      this.doMove(dx, dy, sx, sy, x0, y0);
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
    ['l', 't', 'w', 'h'].forEach(o => rect[o] = DragDrop.grid(rect[o], size));
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
