/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

imageRef: resolve(`$library/RedOwl/assets/opus_wine.webp`),

update(inputs) {
  if (!inputs.imageRef) {
    return {imageRef};
  }
},

render({imageRef}) {
  return {
    imageRef
  }
},

async onSelectImage({eventlet: {key}}) {
  log(`onSelectImage(${key})`);
  return {imageRef: key};
},

async onImageUpload({eventlet: {value}}) {
  log(`onImageUpload`);
  return {imageRef: value}
},

template: html`

<style>
  :host {
    position: relative;
    background-color: transparent;
    flex: 0 !important;
  }
  * {
    box-sizing: border-box;
  }
  img {
    width: 100%;
    /* height: 100%; */
    height: 128px;
    object-fit: contain;
  }
  [slot="overlay"] {
    position: absolute;
    inset: 80px 0px 0px 0px;
  }
  [static] {
    height: 36px;
    object-fit: contain;
    cursor: pointer;
  }
  image-upload {
    display: inline-flex;
    height: 100%;
    vertical-align: middle;
  }
</style>

<div feed Xflex>
  <div toolbar>
    ${['wine', 'soup', 'beer', 'table', 'dog', 'crampons', 'plant-poison-ivy', 'plant-taraxacum'].map(name => {
      const src = `./Library/RedOwl/assets/${name}.png`
      return `<img static on-click="onSelectImage" key="${src}", src="${src}">`
    }).join('')}
    <image-upload on-image="onImageUpload">
      <mwc-button raised>Upload</mwc-button>
    </image-upload>
  </div>
  <img src="{{imageRef}}">
  <div slot="overlay"></div>
</div>

`
});
