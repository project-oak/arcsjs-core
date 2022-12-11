({
/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
shouldRender({mediaDevices}) {
  return Boolean(mediaDevices && mediaDevices.length);
},
render({mediaDevices, mediaDeviceState}) {
  const {isCameraEnabled, isMicEnabled, isAudioEnabled, videoDeviceId, audioInputDeviceId, audioOutputDeviceId} = mediaDeviceState;
  const showCamera = String(isCameraEnabled !== undefined);
  const showSpeaker = String(isAudioEnabled !== undefined);
  const cameraEnabled = Boolean(isCameraEnabled);
  const micEnabled = Boolean(isMicEnabled);
  const audioEnabled = Boolean(isAudioEnabled);
  const devices = values(mediaDevices).map(d => ({name: d.label || 'default', kind: d.kind, key: d.deviceId}));
  const videoInputs = this.renderDevices(devices, 'videoinput', videoDeviceId);
  const audioInputs = this.renderDevices(devices, 'audioinput', audioInputDeviceId);
  const audioOutputs = this.renderDevices(devices, 'audiooutput', audioOutputDeviceId);
  return {
    videoInputs,
    audioInputs,
    audioOutputs,
    showCamera,
    cameraEnabled,
    cameraLigature: cameraEnabled ? `videocam` : `videocam_off`,
    micEnabled,
    micLigature: isMicEnabled ? `mic` : `mic_off`,
    showSpeaker,
    audioEnabled,
    audioLigature: audioEnabled ? `volume_up` : `volume_off`,
  };
},
renderDevices(devices, kind, selectedDeviceId) {
  return devices
    .filter(d => d.kind === kind)
    .map(d => ({...d, selected: Boolean(selectedDeviceId && d.key === selectedDeviceId)}));
},
onCameraClick({mediaDeviceState}) {
  return {
    mediaDeviceState: {
      ...mediaDeviceState,
      isCameraEnabled: !mediaDeviceState.isCameraEnabled
    }
  };
},
onMicClick({mediaDeviceState}) {
  return {
    mediaDeviceState: {
      ...mediaDeviceState,
      isMicEnabled: !mediaDeviceState.isMicEnabled
    },
    transcript: null
  };
},
onAudioClick({mediaDeviceState}) {
  return {
    mediaDeviceState: {
      ...mediaDeviceState,
      isAudioEnabled: !mediaDeviceState.isAudioEnabled
    }
  };

},
onSelectChange({eventlet: {key, value}, mediaDeviceState}) {
  if (key && value) {
    return {
      mediaDeviceState: {
        ...mediaDeviceState,
        [key]: value
      }
    };
  }
},
template: html`
<style>
  :host {
    flex: 0 !important;
  }
  [scrub][toolbar] {
    font-size: 20px;
  }
  icon {
    font-size: 18px;
    margin-right: 2px !important;
  }
  select {
    width: 16px;
    background-color: transparent;
    border: none;
    color: inherit;
  }
</style>

<div scrub toolbar>
  <icon show$="{{showCamera}}" on-click="onCameraClick">{{cameraLigature}}</icon>
  <select show$="{{showCamera}}" repeat="option_t" on-change="onSelectChange" key="videoDeviceId">{{videoInputs}}</select>
  <icon on-click="onMicClick">{{micLigature}}</icon>
  <select repeat="option_t" on-change="onSelectChange" key="audioInputDeviceId">{{audioInputs}}</select>
  <icon show$="{{showSpeaker}}" on-click="onAudioClick">{{audioLigature}}</icon>
  <select show$="{{showSpeaker}}" repeat="option_t" on-change="onSelectChange" key="audioOutputDeviceId">{{audioOutputs}}</select>
  <span flex></span>
</div>

<template option_t>
  <option value="{{key}}" selected="{{selected}}">{{name}}</option>
</template>

<div>{{devices}}</div>
<div frame="micbox"></div>
`
});
