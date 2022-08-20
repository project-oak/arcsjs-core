/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

render({mediaDeviceState}) {
  const {isCameraEnabled, isMicEnabled, videoDeviceId, audioInputDeviceId} = mediaDeviceState;
  return {
    playingVideo: Boolean(isCameraEnabled),
    playingAudio: Boolean(isMicEnabled),
    videoDeviceId,
    audioInputDeviceId
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
<media-stream
    playingvideo="{{playingVideo}}"
    playingaudio="{{playingAudio}}"
    videoDeviceId="{{videoDeviceId}}"
    audioInputDeviceId="{{audioInputDeviceId}}"
    on-devices="onMediaDevices">
</media-stream>
`

});
