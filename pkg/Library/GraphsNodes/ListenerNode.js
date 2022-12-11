/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const ListenerNode = {
  $meta: {
    id: 'ListenerNode',
    displayName: 'Listener',
    category: 'Media'
  },
  $stores: {
    mediaDeviceState: {
      $type: 'MedaDeviceState',
      $value: {
        isMicEnabled: false
      },
      noinspect: true
    },
    mediaDevices: {
      $type: '[JSON]',
      noinspect: true
    },
    transcript: {
      $type: 'String',
      $value: '',
      noinspect: true,
      nomonitor: true
    }
  },
  SpeechRecognizer: {
    $kind: '$library/NewMedia/SpeechRecognizer',
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
      }
    }
  }
};