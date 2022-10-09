/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Resources} from '../../App/Resources.js';

// TODO(sjmiles): make separate services

let Holistic;
const requireHolistic = async () => {
  if (!Holistic) {
    await import('../../../third_party/mediapipe/holistic/holistic.js');
    Holistic = globalThis.Holisitc;
  }
};

//const mpHolistic = globalThis;

const local = import.meta.url.split('/').slice(0, -1).join('/');
//const masque = await loadImage(`assets/masquerade.png`);
//const scalar = 25;

// const masque = await loadImage(`assets/fawkes.png`);
// const scalar = 30;

export const MediapipeService = {
  async holistic({image}) {
    const realCanvas = Resources.get(image?.canvas);
    return realCanvas ? Mediapipe.holistic(realCanvas) : {};
  },
  async clear({target}) {
    const realTarget = Resources.get(target);
    if (realTarget) {
      const ctx = realTarget.getContext('2d');
      ctx.clearRect(0, 0, realTarget.width, realTarget.height);
    }
  },
};

export const Mediapipe = {
  async getHolistic() {
    await requireHolistic();
    const locateFile = file => `${local}/../../third_party/mediapipe/holistic/${file}`;
    const holistic = new Holistic({locateFile});
    holistic.setOptions({
      modelComplexity: 1, // 0, 1, 2
      smoothLandmarks: true, // reduce jitter in landmarks
      //enableSegmentation: true, // also produce segment mask
      //smoothSegmentation: true, // reduce jitter in segment mask
      //refineFaceLandmarks: true, // more detail in mouth and iris
      minDetectionConfidence: 0.5, // human detection thresholds
      minTrackingConfidence: 0.5
    });
    Mediapipe.getHolistic = () => holistic;
    return holistic;
  },
  async holistic(image) {
    return this.classify(await Mediapipe.getHolistic(), image);
  },
  //
  async classify(classifier, testImage) {
    if (Mediapipe.busy) {
      return {};
    }
    // TODO(sjmiles): probably want some timeout protection to keep
    // this from becoming stuck true in case of error
    Mediapipe.busy = true;
    const promise = new Promise(resolve => {
      classifier.onResults(results => {
        resolve(results);
        Mediapipe.busy = false;
      });
      classifier.send({image: testImage});
    });
    //
    const fullResults = await promise;
    const {canvas, image, ...results} = fullResults;
    return {
      results: {...results, width: testImage.width, height: testImage.height}
    };
  },
};
