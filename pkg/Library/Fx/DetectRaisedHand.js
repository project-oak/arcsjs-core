/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
  shouldUpdate({pose}) {
    return pose?.poseLandmarks;
  },
  async update({pose: {poseLandmarks}}, state, {service}) {
    const y = i => poseLandmarks[i].y;
    const [shoulderA, shoulderB, elbowA, elbowB] = [11, 12, 13, 14];
    // elbow above shoulder is considered a raised hand :)
    const raisedHands = y(shoulderA) > y(elbowA) || y(shoulderB) > y(elbowB);
    return {raisedHands};
  }
});
