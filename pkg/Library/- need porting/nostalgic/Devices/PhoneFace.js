/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
render({transcript}, state) {
  const text = String(transcript?.transcript || '').toLowerCase();
  const matches = text.match(/search for (\w*)/);
  if (matches?.length) {
    log(matches);
    const url = `https://en.wikipedia.org/wiki/${matches[1]}`;
    if (state.url !== url) {
      state.url = url;
      return {url};
    }
  }
},
template: html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* light */
    background-color: white;
    color: #333;
  }
</style>
<iframe flex src="{{url}}"></iframe>
`
});