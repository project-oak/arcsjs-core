/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {logFactory} from '../core.js';
import {Resources} from '../App/Resources.js';
import {loadImage} from '../Media/ImageLoader.js';

const log = logFactory(logFactory.flags.services, 'MediaService', 'coral');

const {assign} = Object;
const dom = (tag, props, container) => (container ?? document.body).appendChild(assign(document.createElement(tag), props));
//  const isImproperSize = (width, height) => (width !== 1280 && width !== 640) || (height !== 480 && height !== 720);

export const MediaService = class {
  static async allocateCanvas({width, height}) {
    log('allocateCanvas');
    const canvas = dom('canvas', {style: `display: none; width: ${width || 240}px; height: ${height || 180}px;`});
    return Resources.allocate(canvas);
  }
  static async drawImage({source, target, dx, dy, dw, dh}) {
    const realTarget = Resources.get(target);
    const realSource = Resources.get(source);
    if (realTarget && realSource) {
      let args = [realSource, dx, dy];
      if (dw && dh) {
        args = [...args, dw, dh];
      }
      const ctx = realTarget.getContext('2d');
      ctx.drawImage(realSource, ...args);
    }
  }
};