/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const DeviceUxRecipe = {
  $meta: {
    description: 'Device Ux'
  },
  $stores: {
    isCameraEnabled: {
      $type: 'Boolean'
    },
    isMicEnabled: {
      $type: 'Boolean'
    },
    transcript: {
      $type: 'Transcript',
      $tags: ['shared']
    },
    isAudioEnabled: {
      $type: 'Boolean'
    },
    textForSpeech: {
      $type: 'String',
      $tags: ['shared']
    },
    mediaDevices: {
      $type: '[JSON]'
    }
  },
  deviceUx: {
    $kind: 'Media/DeviceUx',
    $inputs: ['mediaDevices', 'isCameraEnabled', 'isMicEnabled', 'isAudioEnabled', 'transcript'],
    $outputs: ['isCameraEnabled', 'isMicEnabled', 'isAudioEnabled', 'transcript']
  },
  localStream: {
    $kind: 'Media/MediaStream',
    $inputs: [
      'isCameraEnabled'
    ],
    $outputs: [
      'mediaDevices'
    ]
  },
  speechFeed: {
    $kind: 'Media/SpeechRecognizer',
    $inputs: ['isMicEnabled'],
    $outputs: ['isMicEnabled', 'transcript']
  },
  speechOutput: {
    $kind: 'Media/SpeechSynthesizer',
    $inputs: ['isAudioEnabled', 'textForSpeech'],
    $outputs: ['isMicEnabled']
  }
};
