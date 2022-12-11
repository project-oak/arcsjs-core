/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
update({connectedImage, image}, state) {
  if (connectedImage?.canvas || connectedImage?.url) {
    state.image = connectedImage;
  } else {
    state.image = image;
  }
  //log('update: connectedImage, image', connectedImage, image);
  //log('update: state.image', image);
  // const bestImage = connectedImage || image;
  // if (bestImage.url) {
  //   if (!state.image || bestImage.url !== state.image.url) {
  //     state.image = {...bestImage};
  //   }
  // }
},
render(input, {image}) {
  //log('render image: ', image);
  return {image};
},
onCanvas({eventlet: {value}}, state) {
  //log('state.image', state.image, value);
  if (state.image?.url === value?.url) {
    const image = {...value, version: Math.random()};
    state.image = image;
    //log('output image w/canvas', image, value);
    return {image};
  }
},
template: html`
<style>
  image-resource {
    background: transparent;
  }
</style>
<image-resource center flex image="{{image}}" on-canvas="onCanvas"></image-resource>
`
});
