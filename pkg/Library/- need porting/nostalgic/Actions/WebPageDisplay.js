/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
update({url}, state) {
  return this.setUrl(url, state);
},
setUrl(url, state) {
  if (url !== state.url) {
    state.url = url;
    return {url};
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