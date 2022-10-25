/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {DeviceUxRecipe} from '../Media/DeviceUxRecipe.js';

export const CameraNode = {
  $meta: {
    id: 'CameraNode',
    displayName: "Camera",
    category: 'Media'
  },
  $stores: {
    mediaDevices: DeviceUxRecipe.$stores.mediaDevices,
    mediaDeviceState: DeviceUxRecipe.$stores.mediaDeviceState,
    stream: {
      $type: 'Stream',
      $value: 'default'
    },
    fps: {
      $type: 'Number',
      $value: 30
    },
    frame: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    }
  },
  camera: {
    $kind: '$library/NewMedia/Camera',
    $staticInputs: {
      stream: 'default'
    },
    $outputs: ['stream','frame'],
    $slots: {
      device: {
        deviceUx: DeviceUxRecipe.deviceUx,
        defaultStream: DeviceUxRecipe.defaultStream
      },
      capture: {
        imageCapture: {
          $kind: '$library/NewMedia/ImageCapture',
          $inputs: ['stream', 'fps'],
          $outputs: ['frame']
        }
      }
    }
  }
};