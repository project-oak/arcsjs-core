({

/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

update({mediaDeviceState, textForSpeech}, state) {
  if (mediaDeviceState.isAudioEnabled && textForSpeech && textForSpeech !== state.text) {
    state.text = textForSpeech;
    return {mediaDeviceState : {...mediaDeviceState, isMicEnabled: false}};
  }
},
render({}, {text}) {
  return {text};
},
template: html`
  <style>:host, * { display: none !important; }</style>
  <speech-synthesizer text="{{text}}"></speech-synthesizer>
`
});
