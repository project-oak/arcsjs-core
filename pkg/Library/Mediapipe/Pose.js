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
    //log('got pose result', pose);
  }
  pose ??= {
    poseLandmarks: {
      11: {x:0, y:10, z:0}, // shoulder a
      12: {x:0, y:10, z:0}, // shoulder b
      13: {x:0, y:20, z:0}, // elbow a
      14: {x:0, y:10, z:0}, // elbow b
    }
  };
  return {pose};
}
});
