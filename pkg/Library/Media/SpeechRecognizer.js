/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
render({isMicEnabled}) {
  return {micEnabled: Boolean(isMicEnabled)};
},
onTranscript({eventlet: {value}}) {
  return {transcript: value};
},
onEnd() {
  return {isMicEnabled: false};
},
template: html`
  <style>:host, * { display: none !important; }</style>
  <speech-recognizer enabled="{{micEnabled}}" on-transcript="onTranscript" on-end="onEnd"></speech-recognizer>
`
});
