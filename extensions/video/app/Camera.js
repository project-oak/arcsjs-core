/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
mediaApi(service) {
  const media = (msg, data) => service({kind: 'MediaService', msg, data});
  return {
    allocateVideo: async () => media('allocateVideo'),
    assignStream: async (video, stream) => media('assignStream', {video, stream}),
    startFrameCapture: async (video, fps) => media('startFrameCapture', {video, fps})
  }
},
async initialize(inputs, state, {service}) {
  const {allocateVideo} = this.mediaApi(service);
  state.video = await allocateVideo('allocateVideo');
},
async update({stream, fps}, state, {service, invalidate}) {
  const {video, info} = state;
  if (info) {
    timeout(invalidate, 14);
    const frame = {...info.frame, version: Math.random()};
    return {frame};
  }
  const {assignStream, startFrameCapture} = this.mediaApi(service);
  if (stream) {
    await assignStream(video, stream);
    state.info = await startFrameCapture(video, fps || 30);
    invalidate();
  }
}
});
