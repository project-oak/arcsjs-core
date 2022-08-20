({
/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
render({isCameraEnabled, isMicEnabled, isAudioEnabled, transcript}) {
  const cameraEnabled = Boolean(isCameraEnabled);
  const micEnabled = Boolean(isMicEnabled);
  const audioEnabled = Boolean(isAudioEnabled);
  return {
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
    color: var(--theme-color-fg-0);
    background-color: var(--theme-color-bg-1);
    padding: 4px;
  }
  [scrub][toolbar] {
    flex: 1;
    font-size: 24px;
  }
  [mic] {
    background-color: var(--theme-color-bg-1);
    border: 1px solid #f1f1f1;
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
    color: var(--theme-color-bg-0);
    overflow: hidden;
    height: 0;
    transition: all 200ms ease-out;
  }
  [micbox][showing] {
    height: 48px;
  }
  icon {
    font-size: 20px;
  }
</style>

<div scrub toolbar>
  <icon on-click="onCameraClick">{{cameraLigature}}</icon>
  <icon on-click="onMicClick">{{micLigature}}</icon>
  <icon on-click="onAudioClick">{{audioLigature}}</icon>
</div>

<div micbox bar showing$="{{micEnabled}}">
  <icon>mic</icon>
  <input mic value="{{text}}" on-change="onTextChange"/>
</div>
`
});
