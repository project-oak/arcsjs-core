/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Resources} from '../App/Resources.js';

// late-bind the dependencies to reduce so we pay-for-usage

let CocoSsdModel;

const requireCocoSsdModel = async () => {
  if (!CocoSsdModel) {
    await import('../../third_party/tensorflow-models/coco-ssd.min.js');
    if (globalThis.cocoSsd) {
      CocoSsdModel = await new Promise(resolve => globalThis.cocoSsd.load().then(resolve));
    }
  }
  return CocoSsdModel;
};

export const CocoSsdService = {
  async classify({image}) {
    // get our input canvas objects
    const realImage = Resources.get(image?.canvas);
    // confirm dependencies
    if (realImage) {
      const {width, height} = realImage;
      if (width && height) {
        // late-binding so we only load on demand
        const cocoSsdModel = await requireCocoSsdModel();
        // classify!
        return new Promise(resolve => cocoSsdModel?.detect(realImage).then(resolve));
      }
    }
  }
};
