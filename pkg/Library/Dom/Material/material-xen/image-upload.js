/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Xen} from '../../Xen/xen-async.js';
import {logFactory} from '../../../core.js';

const template = Xen.Template.html`
  <style>
    ::slotted(*) {
      cursor: pointer;
    }
    label {
      display: block;
    }
    input[type="file"] {
      display: none;
    }
  </style>
  <label on-click="onClick">
    <input type="file" accept$="{{accept}}" multiple$="{{multiple}}" on-change="onFilesChanged">
    <slot></slot>
  </label>
`;

const log = logFactory(true, 'ImageUpload', '#ffb9b4');

export class ImageUpload extends Xen.Async {
  onClick(e) {
    e.stopPropagation();
  }
  get template() {
    return template;
  }
  static get observedAttributes() {
    return ['multiple', 'accept'];
  }
  render({accept, multiple}) {
    return {accept, multiple};
  }
  onFilesChanged(e) {
    const files = e.currentTarget.files;
    for (let i=0; i<files?.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const img = document.createElement("img");
        const reader = new FileReader();
        reader.onload = () => {
          img.src = reader.result;
          this.value = img.src;
          // log(this.value);
          this.fire('image', img);
        };
        reader.readAsDataURL(file);
      }
    }
  }
}
