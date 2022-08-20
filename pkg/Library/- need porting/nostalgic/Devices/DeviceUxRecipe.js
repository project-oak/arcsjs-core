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
    }
  },
  deviceUx: {
    $kind: 'Devices/DeviceUx',
    $bindings: {
      isCameraEnabled: '',
      isMicEnabled: '',
      isAudioEnabled: '',
      transcript: ''
    }
  },
  localStream: {
    $kind: 'Media/MediaStream',
    $bindings: {
      isCameraEnabled: ''
    }
  },
  speechFeed: {
    $kind: 'Media/SpeechRecognizer',
    $bindings: {
      isMicEnabled: '',
      transcript: ''
    }
  },
  speechOutput: {
    $kind: 'Media/SpeechSynthesizer',
    $bindings: {
      isMicEnabled: '',
      isAudioEnabled: '',
      textForSpeech: ''
    }
  }
};