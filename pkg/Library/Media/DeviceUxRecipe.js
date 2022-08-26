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
    mediaDeviceState: {
      $type: 'MedaDeviceState',
      $value: {
        isCameraEnabled: false,
        isMicEnabled: false,
        isAudioEnabled: false,
        // videoDeviceId
        // audioOutputDeviceId
      }
    },
    mediaDevices: {
      $type: '[JSON]'
    },
    textForSpeech: {
      $type: 'String',
      $tags: ['shared']
    }
  },
  deviceUx: {
    $kind: 'Media/DeviceUx',
    $inputs: ['mediaDevices', 'mediaDeviceState'],
    $outputs: ['mediaDeviceState']
  },
  defaultStream: {
    $kind: 'Media/MediaStream',
    $inputs: [
      'mediaDeviceState'
    ],
    $outputs: [
      'mediaDevices'
    ]
  },
  speechFeed: {
    $kind: 'Media/SpeechRecognizer',
    $inputs: ['mediaDeviceState'],
    $outputs: ['mediaDeviceState', 'transcript']
  },
  speechOutput: {
    $kind: 'Media/SpeechSynthesizer',
    $inputs: ['mediaDeviceState', 'textForSpeech'],
    $outputs: ['mediaDeviceState']
  }
};

export const SpeechRecipe = {
  $meta: {
    description: 'speech in/out'
  },
  $stores: {
    mediaDeviceState: {
      $type: 'MedaDeviceState',
      $value: {}
    },
    transcript: {
      $type: 'Transcript',
      $tags: ['shared']
    },
    textForSpeech: {
      $type: 'String',
      $tags: ['shared'],
      // uncomment to test speech synthesizer:
      // $value: 'hello world!'
    }
  },
  micBox: {
    $kind: 'Media/MicBox',
    $inputs: ['mediaDeviceState', 'transcript'],
    $container: 'deviceUx#micbox'
  },
  speechFeed: {
    $kind: 'Media/SpeechRecognizer',
    $inputs: ['mediaDeviceState'],
    $outputs: ['mediaDeviceState', 'transcript']
  },
  speechOutput: {
    $kind: 'Media/SpeechSynthesizer',
    $inputs: ['mediaDeviceState', 'textForSpeech'],
    $outputs: ['mediaDeviceState']
  }
};
