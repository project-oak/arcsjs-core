/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

shouldRender({image}) {
  return Boolean(image);
},

template: html`
<style>
  :host {
    position: relative;
    overflow: hidden;
    width: 160px;
    height: 128px;
  }
  image-resource {
    width: 100%;
    height: 100%;
  }
</style>

<image-resource image="{{image}}"></image-resource>
`
});
