/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

let waitFor = 0;

export const PoseService = {
  async classify({image}) {
    // JIT
    const pose = await globalThis.requirePose();
    // don't hammer the mediapipe
    const t = Date.now();
    if (t < waitFor) {
      console.log('[skipping classify: frequency too high]');
      return;
    }
    waitFor = t + 200;
    // must be a real boy
    const realImage = Resources.get(image?.canvas);
    // confirm stability
    if (realImage?.width && realImage?.height) {
      // convert callback to async syntax
      return new Promise(async resolve => {
        // never gets here
        pose.onResults(results => {
          console.log('resolving pose promise', results);
          resolve(results);
        });
        console.log('sending image for async classification...');
        const result = await pose.send(realImage);
        console.log('returned.', result);
        setTimeout(resolve, 500);
      });
    }
  }
};
