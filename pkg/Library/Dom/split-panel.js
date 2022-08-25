/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen, DragDrop} from '../core.js';

const template = Xen.Template.html`
<style>
  :host {
    width: 100%;
    height: 100%;
    display: flex;
  }

  [image-grid] {
    padding: 4px;
    display: flex;
    flex-wrap: wrap;
    flex-shrink: 0;
    flex-grow: 0;
    align-content: flex-start;
    overflow-y: overlay;
    background-color: #f3f3f3;
  }

  [image-grid]::-webkit-scrollbar {
    width: 10px;
  }

  [image-grid]::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, .2);
  }

  [image-grid]::-webkit-scrollbar-thumb {
    border: 2px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    border-radius: 9999px;
    background-color: rgba(0, 0, 0, .12);
  }

  [image-grid]::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, .22);
  }

  [image-viewer] {
    flex-grow: 1;
    padding: 8px;
    position: relative;
  }

  [resizer] {
    position: absolute;
    left: 0;
    top: 0;
    width: 7px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ew-resize;
  }

  [resizer]:hover,
  [resizer][dragging] {
    background-color: #e6e6e6;
  }

  [handle] {
    width: 2px;
    height: 12px;
    background-color: #ccc;
    border: 1px solid white;
  }

  [thumbnail] {
    box-sizing: border-box;
    cursor: pointer;
    position: relative;
  }

  [thumbnail]:hover [border] {
    box-shadow: inset 0px 0px 0px 1px #bbb;
  }

  [thumbnail] img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  [border] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    box-shadow: inset 0px 0px 0px 1px #e9e9e9;
  }

  [thumbnail][selected] [border] {
    box-shadow: inset 0px 0px 0px 2px #2b7de9;
  }

  canvas {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>

<div image-grid repeat="img_t">{{images}}</div>
<div image-viewer>
  <canvas></canvas>
  <div resizer dragging$="{{dragging}}" on-pointerdown="onDown">
    <div handle></div>
  </div>
</div>

<template img_t>
  <div thumbnail xen:style="{{thumbnailStyle}}" selected$="{{selected}}">
    <img src="{{url}}" on-click="onThumbnailClicked">
    <div border></div>
  </div>
</template>
`;

const THUMBNAIL_IMAGE_SIZE = 64;
const THUMBNAIL_MARGIN = 1;
const THUMBNAIL_SIZE = THUMBNAIL_IMAGE_SIZE + THUMBNAIL_MARGIN * 2;
const DEFAULT_NUM_COLS = 3;

/**
* A node that shows a grid of image thumbnails and previews the selected image.
* Users can drag the divider between the grid and preview area to resize. The
* canvas id of the preview image will be sent out through the "rendered" event.
*/
export class InputImage extends DragDrop {
  static get observedAttributes() {
    return ['urls'];
  }

  get template() {
    return template;
  }

  async _didMount() {
    // The canvas to render the final result.
    this.state.canvas = this._dom.$('canvas');
    // Store the canvas in Resources.
    this.state.canvasId = allocateResource();
    globalThis.resources[this.state.canvasId] = this.state.canvas;

    // Set initial width of the image grid.
    this.state.imageGrid = this._dom.$('[image-grid]');
    this.state.imageGrid.style.width = `${DEFAULT_NUM_COLS * THUMBNAIL_SIZE}px`;

    // Up listener for dragging the image grid resizer.
    this.state.upListener = () => {
      document.body.style.cursor = 'default';
      document.removeEventListener('pointerup', this.state.upListener);
      this.state.dragging = false;
      this.invalidate();
    };
  }

  update({urls}, state) {
    if (!urls) {
      return;
    }

    // Set the first image as the currently selected one by default.
    if (!state.selectedUrl) {
      // TODO(jingjin): provide better re-entry protection. For now this is ok
      // since it will only get called once.
      this.setSelectedUrl(urls[0]);
    }
  }

  render({urls}, state) {
    return {
      images: urls.map(url => {
        return {
          url,
          selected: state.selectedUrl === url,
          thumbnailStyle: {
            'width': `${THUMBNAIL_IMAGE_SIZE}px`,
            'height': `${THUMBNAIL_IMAGE_SIZE}px`,
            'margin': `${THUMBNAIL_MARGIN}px`,
          }
        };
      }),
      dragging: state.dragging,
    };
  }

  async onThumbnailClicked(event) {
    await this.setSelectedUrl(event.target.src);
    this.invalidate();
  }

  async setSelectedUrl(url) {
    // Render the selected image to the canvas as output.
    this.state.selectedUrl = url;
    await renderImageToCanvas(
        {url: this.state.selectedUrl}, this.state.canvas, globalThis.resources);
    this.fireRenderedEvent();
  }

  fireRenderedEvent() {
    this.value = this.state.canvasId;
    this.fire('rendered');
  }

  // implement drag-drop handlers to support resizing the image grid.
  doDown(e) {
    e.stopPropagation();
    document.body.style.cursor = 'ew-resize';
    this.state.imageGridWidth = this.state.imageGrid.offsetWidth;
    document.addEventListener('pointerup', this.state.upListener);
    this.state.dragging = true;
    this.invalidate();
  }

  doMove(dx, dy) {
    const newWidth =
        DragDrop.grid(this.state.imageGridWidth + dx, THUMBNAIL_SIZE);
    this.state.imageGrid.style.width =
        `${Math.max(newWidth, THUMBNAIL_SIZE)}px`;
  }
}
customElements.define('input-image', InputImage);
