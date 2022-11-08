/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const CameraNode = {
  $meta: {
    id: 'CameraNode',
    displayName: "Camera",
    category: 'Media'
  },
  $stores: {
    mediaDeviceState: {
      $type: 'MedaDeviceState',
      $value: {
        isCameraEnabled: false,
        isMicEnabled: false,
        isAudioEnabled: false,
        // videoDeviceId
        // audioOutputDeviceId
      },
      noinspect: true
    },
    mediaDevices: {
      $type: '[JSON]',
      noinspect: true
    },
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
    $inputs: ['stream'],
    $outputs: ['stream', 'frame'],
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
        },
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