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
  const outputs = value;
  if (value.transcript) {
    assign(outputs, {
      mediaDeviceState: {...mediaDeviceState, isMicEnabled: false}
    });
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
  [capture] {
    height: 0;
    overflow: hidden;
    visibility: false;
  }
</style>

<div><slot name="device"></slot></div>
<speech-recognizer enabled="{{micEnabled}}" on-transcript="onTranscript" on-end="onEnd"></speech-recognizer>
<div><slot name="transcript"></slot></div>
`
});
