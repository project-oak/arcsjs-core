/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
// import {etc} from "./arcs.js";
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
    "composedFrame1": {
      $type: 'Image'
    },
    "composedFrame2": {
      $type: 'Image'
    },
    "frame": {
      $type: 'Image'
    },
    "pixiFrame": {
      $type: 'Image'
    }
  },
  deviceimage1: {
    $kind: '$library/NewMedia/DeviceImage.js',
    $inputs: [{image: 'frame'}],
    $outputs: [{output: 'deviceimage1:output'}]
  },
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
  //
  pixi: {
    $kind: '$library/PixiJs/PixiJs',
    $staticInputs: {
      demo: 'Spiral'
    },
    $outputs: [{
      image: 'pixiFrame'
    }]
  },
  SelfieSegmentation: {
    $kind: 'Mediapipe/SelfieSegmentation',
    $inputs: [
      {'image': 'camera1:input'}
    ],
    $outputs: [
      {'mask': 'selfieFrame'}
    ]
  },
  compose1: {
    $kind: '$library/NewMedia/ImageComposite',
    $staticInputs: {
      operation: 'overlay'
    },
    $inputs: [
      {imageA: 'camera1:input'},
      {imageB: 'pixiFrame'}
    ],
    $outputs: [
      {output: 'composedFrame1'}
    ]
  },
  compose2: {
    $kind: '$library/NewMedia/ImageComposite',
    $staticInputs: {
      operation: 'source-over'
    },
    $inputs: [
      {imageA: 'composedFrame1'},
      {imageB: 'selfieFrame'}
    ],
    $outputs: [
      {output: 'composedFrame2'}
    ]
  },
  shader: {
    $kind: '$library/Shader/FragmentShader',
    $staticInputs: {
      shader: giantInLake
    },
    $inputs: [
      {'image': 'composedFrame2'}
    ],
    $outputs: [
      {'outputImage': 'frame'}
    ]
  }
};
