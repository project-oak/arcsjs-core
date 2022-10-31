/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {etc} from "./arcs.js";
import {giantInLake} from "../assets/giantInLake.js";

export const ExtRecipe = {
  $stores: {
    "camera1:input": {
      $type: 'Image'
    },
    "deviceimage1:output": {
      $type: 'Image'
    },
    "shaderFrame": {
      $type: 'Image'
    },
    "selfieFrame": {
      $type: 'Image'
    },
    "composedFrame": {
      $type: 'Image',
    },
    "frame": {
      $type: 'Image',
    },
    // "mask": {
    //   $type: 'Image',
    // }
  },
  deviceimage1: {
    $kind: '$library/NewMedia/DeviceImage.js',
    $inputs: [{image: 'frame'}],
    $outputs: [{output: 'deviceimage1:output'}]
  },
  //
  // pixi: {
  //   $kind: '$library/PixiJs/PixiJs',
  //   $staticInputs: {
  //     demo: 'Spiral'
  //   },
  //   $outputs: [{
  //     image: 'pixiFrame'
  //     //image: 'deviceimage1:output'
  //   }]
  // },
  //
  // noop: {
  //   $kind: '$library/Noop',
  //   // $staticInputs: {
  //   //   html: `<div frame="device" style="display: none;"></div>`
  //   // },
  //   $slots: {
  //     device: etc.DeviceUxRecipe
  //   }
  // },
  // camera: {
  //   $kind: '$app/Camera',
  //   $inputs: ['stream', 'fps'],
  //   // $outputs: ['frame']
  //   $outputs: ['deviceimage1:output']
  // },
  //
  SelfieSegmentation: {
    $kind: 'Mediapipe/SelfieSegmentation',
    $inputs: [
      {'image': 'camera1:input'}
    ],
    $outputs: [
      {'mask': 'selfieFrame'}
    ]
  },
  composed: {
    $kind: '$library/NewMedia/Composite',
    $staticInputs: {
      operation: 'source-over'
    },
    $inputs: [
      {imageA: 'camera1:input'},
      {imageB: 'selfieFrame'}
    ],
    $outputs: [
      {output: 'composedFrame'}
    ]
  },
  shader: {
    $kind: '$library/Shader/FragmentShader',
    $staticInputs: {
      shader: giantInLake
    },
    $inputs: [
      {'image': 'composedFrame'}
    ],
    $outputs: [
      {'outputImage': 'frame'}
    ]
  }
};
