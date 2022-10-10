/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
shouldRender({image}) {
  return Boolean(image?.canvas);
},
async update({image}, state, {service}) {
  const data = await service({kind: 'MediapipeService', msg: 'holistic', data: {image}});
  if (data?.canvas) {
    //await service({kind: 'MediapipeService', msg: 'renderSticker', data: output});
    data.image = {canvas: data.canvas, stream: image?.stream, version: Math.random()};
    state.data = data;
  }
  return {data};
},
// render({image}, {data}) {
//   return {
//     image: data?.image,
//     stream: image?.stream
//   };
// },
// template: html`
// <style>
//   :host {
//     position: relative;
//   }
//   image-resource {
//     position: absolute;
//     inset: 0;
//   }
// </style>
// <stream-view flex stream="{{stream}}"></stream-view>
// <image-resource flex image="{{image}}"></image-resource>
// `
});
