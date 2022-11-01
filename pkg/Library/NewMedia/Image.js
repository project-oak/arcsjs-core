/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
update({connectedImage, image}, state) {
  state.bestImage = {...image, ...connectedImage};
},
onCanvas({eventlet: {value}}) {
  return {image: {...value, version: Math.random()}};
},
template: html`
<style>
  image-resource {
    background: transparent;
  }
</style>
<image-resource center flex image="{{bestImage}}" on-canvas="onCanvas"></image-resource>
`
});
