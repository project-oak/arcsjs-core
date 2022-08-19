/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
shouldRender({mediaDevices}) {
  return Boolean(mediaDevices && mediaDevices.length);
},
render({mediaDevices, isCameraEnabled, isMicEnabled, isAudioEnabled, transcript}) {
  const cameraEnabled = Boolean(isCameraEnabled);
  const micEnabled = Boolean(isMicEnabled);
  const audioEnabled = Boolean(isAudioEnabled);
  const devices = values(mediaDevices).map(d => ({name: d.label || 'default', kind: d.kind}));
  const videoInputs = devices.filter(d => d.kind === 'videoinput');
  const audioInputs = devices.filter(d => d.kind === 'audioinput');
  const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
  return {
    videoInputs,
    audioInputs,
    audioOutputs,
    cameraEnabled,
    cameraLigature: cameraEnabled ? `videocam` : `videocam_off`,
    micEnabled: micEnabled,
    micLigature: isMicEnabled ? `mic` : `mic_off`,
    audioEnabled,
    audioLigature: audioEnabled ? `volume_up` : `volume_off`,
    text: transcript?.transcript || transcript?.interimTranscript || ''
  };
},
onCameraClick({isCameraEnabled}) {
  return {isCameraEnabled: !isCameraEnabled};
},
onMicClick({isMicEnabled}) {
  return {isMicEnabled: !isMicEnabled, transcript: null};
},
onAudioClick({isAudioEnabled}) {
  return {isAudioEnabled: !isAudioEnabled};
},
onTextChange({eventlet: {value}}) {
  return {transcript: {transcript: value}};
},
template: html`
<style>
  :host {
    flex: 0 !important;
    /* padding: 4px; */
  }
  [scrub][toolbar] {
    font-size: 24px;
    /* padding-left: 0; */
  }
  [mic] {
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    margin: 6px;
    transition: all 200ms ease-out;
    width: 100%;
  }
  [mic][showing] {
    transform: translateY(0px);
  }
  [micbox] {
    overflow: hidden;
    height: 0;
    transition: all 200ms ease-out;
  }
  [micbox][showing] {
    height: 48px;
  }
  icon {
    font-size: 20px;
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
  <icon on-click="onCameraClick">{{cameraLigature}}</icon>
  <select repeat="option_t" on-change="onSelectChange">{{videoInputs}}</select>
  <icon on-click="onMicClick">{{micLigature}}</icon>
  <select repeat="option_t" on-change="onSelectChange">{{audioInputs}}</select>
  <icon on-click="onAudioClick">{{audioLigature}}</icon>
  <select repeat="option_t" on-change="onSelectChange">{{audioOutputs}}</select>
  <span flex></span>
</div>

<template option_t>
  <option value="{{key}}" selected="{{selected}}">{{name}}</option>
</template>

<div>{{devices}}</div>

<div micbox bar showing$="{{micEnabled}}">
  <icon>mic</icon>
  <input mic value="{{text}}" on-change="onTextChange"/>
</div>
`
});
