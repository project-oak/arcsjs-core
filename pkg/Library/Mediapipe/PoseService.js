/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Resources} from '../App/Resources.js';
import {MediapipeClassifier} from './MediapipeClassifier.js';

// late-bind the dependencies so we pay for it only when using it

const local = import.meta.url.split('/').slice(0, -1).join('/');
const locateFile = file => {
  console.log(file, `${local}/../../third_party/mediapipe/pose/${file}`);
  return `${local}/../../third_party/mediapipe/pose/${file}`;
};

let Pose;
const requirePose = async () => {
  if (!Pose) {
    await MediapipeClassifier.import('../../third_party/mediapipe/pose/pose.js');
    Pose = globalThis.Pose;
  }
};

export const PoseService = {
  async classify({image, target}) {
    // get our input canvas object
    const realImage = Resources.get(image?.canvas);
    // confirm stability
    if (realImage?.width && realImage?.height) {
      // classify!
      return MediapipePoseModel.pose(realImage);
    }
  }
};

export const MediapipePoseModel = {
  ...MediapipeClassifier,
  async pose(image) {
    return this.classify(await this.getPose(), image);
  },
  async getPose() {
    await requirePose();
    const pose = new Pose({locateFile});
    pose.setOptions({
      staticImageMode: true, // optimize with frame coherence, or not
      // maxNumFaces: 1,
      // modelComplexity: 1, // 0, 1, 2
      // smoothLandmarks: true,
      // minDetectionConfidence: 0.5,
      // minTrackingConfidence: 0.5
    });
    this.getPose = () => pose;
    return pose;
  },
};
