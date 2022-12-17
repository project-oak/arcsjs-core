/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
shouldUpdate({image}) {
  return image;
},
async update({image}, state, {service}) {
  let pose = await service({kind: 'PoseService', msg: 'classify', data: {image}});
  if (pose !== undefined) {
    log('got pose result', pose);
  }
  pose ??= {
    poseLandmarks: {
      11: [0, 10, 0], // shoulder a
      12: [0, 10, 0], // shoulder b
      13: [0, 20, 0], // elbow a
      14: [0, 10, 0], // elbow b
    }
  };
  return {pose};
}
});
