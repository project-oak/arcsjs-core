/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
render({mediaDeviceState}) {
  return {micEnabled: Boolean(mediaDeviceState?.isMicEnabled)};
},
onTranscript({eventlet: {value}, mediaDeviceState}) {
  const transcript = value.transcript || value.interimTranscript;
  const outputs = {transcript};
  if (value.transcript) {
    assign(outputs, {mediaDeviceState: {...mediaDeviceState, isMicEnabled: false}});
  }
  return outputs;
},
// onEnd({mediaDeviceState}) {
//   return {mediaDeviceState: {...mediaDeviceState, isMicEnabled: false}};
// },
template: html`
<style>
  :host {
    color: var(--theme-color-fg-2);
    background-color: var(--theme-color-bg-2);
    overflow: hidden;
  }
  [frame="capture"] {
    height: 0;
    overflow: hidden;
    visibility: false;
  }
</style>

<div frame="device"></div>
<speech-recognizer enabled="{{micEnabled}}" on-transcript="onTranscript" on-end="onEnd"></speech-recognizer>
<div frame="transcript"></div>
`
});
