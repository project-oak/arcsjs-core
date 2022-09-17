/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import '../mediapipe/holistic.js';
// import './mediapipe/camera_utils.js';
// import './mediapipe/control_utils.js';
import '../mediapipe/drawing_utils.js';

const local = import.meta.url.split('/').slice(0, -1).join('/');

const {Holistic/*, FACEMESH_TESSELATION, drawConnectors: lines, drawLandmarks: marks*/} = globalThis;

export const getHolistic = () => {
  const holistic = new Holistic({locateFile: file => (`${local}/mediapipe/${file}`)});
  holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  return holistic;
};