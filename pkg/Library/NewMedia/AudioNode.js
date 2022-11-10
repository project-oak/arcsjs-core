/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {DeviceUxRecipe} from '../Media/DeviceUxRecipe.js';

export const AudioNode = {
  $meta: {
    id: 'AudioNode',
    displayName: "Audio",
    category: 'Media'
  },
  $stores: {
    mediaDevices: DeviceUxRecipe.$stores.mediaDevices,
    mediaDeviceState: DeviceUxRecipe.$stores.mediaDeviceState,
    transcript: {
      $type: 'String',
      noinspect: true,
      nomonitor: true
    }
  },
  audio: {
    $kind: '$library/NewMedia/SpeechRecognizer',
    $staticInputs: {
      stream: 'default'
    },
    $inputs: ['mediaDeviceState'],
    $outputs: ['transcript', 'mediaDeviceState'],
    $slots: {
      device: {
        deviceUx: DeviceUxRecipe.deviceUx,
        defaultStream: DeviceUxRecipe.defaultStream
      },
      transcript: {
        textCapture: {
          $kind: '$library/Fields/TextField',
          $inputs: [{value: 'transcript'}],
          $staticInputs: {label: 'transcript'}
        }
      }
    }
  }
};