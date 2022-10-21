/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../Library/Dom/Xen/xen-async.js';

const template = Xen.Template.html`
<style>
  [container] {
    position: relative;
    cursor: grab;
    padding: 9px 0 9px 30px;
    user-select: none;
  }
  [container][draggable="true"]:hover {
    background: var(--theme-color-bg-4);
  }
  [container][draggable="true"]:hover icon {
    display: flex;
    align-items: center;
  }
  icon {
    display: none;
    font-family: "Material Icons";
    font-style: normal;
    font-feature-settings: "liga";
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
    cursor: pointer;
    user-select: none;
    flex-shrink: 0;
    vertical-align: middle;
    overflow: hidden;
    pointer-events: none;
    height: 100%;
    align-items: center;
    top: 0;
    left: 9px;
    position: absolute;
  }
  [label] {
    font-size: 12px;
    font-weight: normal;
    line-height: 14px;
    text-transform: capitalize;
  }
</style>

<div container draggable="{{draggable}}" on-mouseenter="onEnter" on-mouseleave="onLeave" on-dragstart="onDragStart">
  <icon>drag_indicator</icon>
  <div label on-click="onItemClick">{{name}}</div>
</div>

`;

/**
 * A simple wrapper around a item label that is draggable.
 *
 * It reacts to "dragstart" event and sets the data payload to be the key of
 * the item.
 *
 * Attributes:
 *   - key: the key of the item.
 *   - name: the name of the item.
 *
 * Events:
 *   - item-clicked:
 *       fired when a item is clicked.
 */
export class DraggableItem extends Xen.Async {
  static get observedAttributes() {
    return ['key', 'name', 'disabled'];
  }

  get template() {
    return template;
  }

  render({name, disabled}) {
    return {
      name,
      draggable: !disabled
    };
  }

  onItemClick(e) {
    this.fire('item-clicked');
  }

  onDragStart(e) {
    // This will hide the popup panel for the hovered item.
    this.fire('leave');
    //console.log('[onDragStart]', this.key);
    //e.dataTransfer.setData('arcs/drag', this.key);
    e.dataTransfer.setData('text/plain', this.key);
  }

  onEnter(e) {
    // Get the distance between the item element and the top of the main
    // app container. This value will be used to position the popup panel that
    // shows the info the hovered item.
    const {top, left, width} = this.host.host.getBoundingClientRect();
    this.value = {top, left: left + width};
    this.fire('enter');
  }

  onLeave(e) {
    this.fire('leave');
  }
}
customElements.define('draggable-item', DraggableItem);
