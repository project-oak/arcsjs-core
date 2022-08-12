/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../../Dom/xen/xen-async.js';

const template = Xen.Template.html`
<style>
  :host {
    position: relative;
    display: inline-flex;
    line-height: 0;
    user-select: none;
    white-space: normal;
    width: 64px;
    height: 64px;
    flex-shrink: 0;
    flex-grow: 0;
  }
  * {
    box-sizing: border-box;
  }
  avatar, device {
    display: inline-block;
    /* aliasing occurs at 3px */
    border-radius: 50%;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
  avatar > img {
    background-color: white;
    width: 100%;
    height: 100%;
  }
  device {
    position: absolute;
    width: 50%;
    height: 50%;
    right: -14px;
    bottom: 0px;
  }
  device > img {
    background-color: white;
    padding: 4px;
    width: 100%;
    height: 100%;
  }
  device[hidden] {
    display: none;
  }
</style>

<avatar><img draggable="false" src="{{avatar}}"></avatar>
<!-- <device hidden="{{hideDevice}}"><img draggable="false" src="{{device}}"></device> -->
`;

export class TenantIcon extends Xen.Async {
  static get observedAttributes() {
    return ['avatar', 'device'];
  }
  get template() {
    return template;
  }
  render({avatar, device}) {
    return {
      avatar: avatar || './Library/assets/user.png',
      device: device || './Library/assets/device.png',
      hideDevice: avatar && !device
    };
  }
}
