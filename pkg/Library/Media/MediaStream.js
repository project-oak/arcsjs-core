/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

render({isCameraEnabled, isMicEnabled}) {
  return {
    playingVideo: Boolean(isCameraEnabled),
    playingAudio: Boolean(isMicEnabled)
  };
},

onMediaDevices({eventlet: {value}}) {
  const mediaDevices = create(null);
  for (const device of value) {
    let {deviceId, kind, label, groupId} = device;
    mediaDevices[`${kind}:${label}`] = {deviceId, kind, label, groupId};
  }
  return {mediaDevices};
},

template: html`
<style>
  :host, media-stream {
    display: none !important;
  }
</style>
<media-stream playingvideo="{{playingVideo}}" playingaudio="{{playingAudio}}" on-devices="onMediaDevices"></media-stream>
`

});
