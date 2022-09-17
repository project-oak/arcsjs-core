/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Resources} from '../App/Resources.js';
import './mediapipe/holistic.js';
const {Holistic} = globalThis;
//import '../mediapipe/drawing_utils.js';
// const {FACEMESH_TESSELATION, drawConnectors: lines, drawLandmarks: marks} = globalThis;

const local = import.meta.url.split('/').slice(0, -1).join('/');
const locateFile = file => `${local}/mediapipe/${file}`;

export const MediapipeService = {
  async holistic(image) {
    const realCanvas = Resources[image?.canvas];
    return Mediapipe.holistic(realCanvas);
  }
};

export const Mediapipe = {
  getHolistic() {
    const holistic = new Holistic({locateFile});
    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    MediapipeService.getHolistic = () => holistic;
    return holistic;
  },
  async holistic(image) {
    const classifier = MediapipeService.getHolistic();
    return classifier.send({image});
  }
};
