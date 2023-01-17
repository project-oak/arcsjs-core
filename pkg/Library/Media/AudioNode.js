/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const AudioNode = {
  $meta: {
    id: 'AudioNode',
    displayName: "Audio",
    category: 'Media'
  },
  $stores: {
    mediaDevices: {
      $type: '[JSON]',
      noinspect: true,
      // nodisplay: true
    },
    mediaDeviceState: {
      $type: 'MedaDeviceState',
      noinspect: true,
      // nodisplay: true,
      $value: {
        isCameraEnabled: false,
        isMicEnabled: false,
        isAudioEnabled: false
      }
    },
    transcript: {
      $type: 'String',
      noinspect: true,
      nomonitor: true
    }
  },
  audio: {
    $kind: '$library/Media/SpeechRecognizer',
    $staticInputs: {
      stream: 'default'
    },
    $inputs: ['mediaDeviceState'],
    $outputs: ['transcript', 'mediaDeviceState'],
    $slots: {
      device: {
        deviceUx: {
          $kind: 'Media/DeviceUx',
          $inputs: ['mediaDevices', 'mediaDeviceState'],
          $outputs: ['mediaDeviceState']
        },
        defaultStream: {
          $kind: 'Media/MediaStream',
          $inputs: ['mediaDeviceState'],
          $outputs: ['mediaDevices']
        }
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
