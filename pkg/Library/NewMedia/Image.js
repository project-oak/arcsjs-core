/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
onCanvas({eventlet: {value}}) {
  return {image: value};
},
template: html`
<style>
  /* :host {
  } */
  image-resource {
    background: transparent;
  }
</style>
<image-resource center flex image="{{image}}" on-canvas="onCanvas"></image-resource>
`
});
