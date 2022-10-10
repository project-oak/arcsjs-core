/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Resources} from '../App/Resources.js';
import {MediapipeClassifier} from './MediapipeClassifier.js';

// late-bind the dependencies to reduce so we pay-for-usage

let SelfieSegmentation;
const requireSelfieSegmentation = async () => {
  if (!SelfieSegmentation) {
    await MediapipeClassifier.import('../../third_party/mediapipe/selfie_segmentation/selfie_segmentation.js');
    SelfieSegmentation = globalThis.SelfieSegmentation;
  }
};

const local = import.meta.url.split('/').slice(0, -1).join('/');
const locateFile = file => `${local}/../../third_party/mediapipe/selfie_segmentation/${file}`;

export const SelfieSegmentationService = {
  async classify({image, target}) {
    // get our input canvas objects
    const [realImage, realTarget]= [Resources.get(image?.canvas), Resources.get(target)];
    // confirm stability
    if (realTarget && realImage) {
      const {width, height} = realImage;
      if (width && height) {
        // classify!
        const results = await MediapipeModel.selfieSegmentation(realImage, realTarget);
        // compute output canvas
        const bitmap = results?.results?.segmentationMask;
        this.render(bitmap, realTarget, width, height);
      }
    }
    // return our target canvas
    return {canvas: target, stream: image?.stream, version: Math.random()};
  },
  render(bitmap, target, width, height) {
    if (bitmap) {
      target.width = width;
      target.height = height;
      const ctx = target.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);
      // Only overwrite existing pixels.
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = '#680fa3'; //'#00FF00';
      ctx.fillRect(0, 0, width, height);
    }
  }
};

export const MediapipeModel = {
  ...MediapipeClassifier,
  async selfieSegmentation(image) {
    return this.classify(await this.getSelfieSegmentation(), image);
  },
  async getSelfieSegmentation() {
    await requireSelfieSegmentation();
    const selfieSegmentation = new SelfieSegmentation({locateFile});
    selfieSegmentation.setOptions({
      modelSelection: 1 // 0=default, 1=landscape
    });
    this.getSelfieSegmentation = () => selfieSegmentation;
    return selfieSegmentation;
  },
};
