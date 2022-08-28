/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
update({url}, state) {
},

render({url}, state) {
  return {
    url
  };
},

onStream({eventlet: {key: audioStream}}) {
  return {audioStream};
},

template: html`
<style>
  :host {
    background-color: white;
  }
</style>
<simple-audio flex src="{{url}}" controls on-stream="onStream"></simple-audio>
`
});