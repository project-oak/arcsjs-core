/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const VideoFeedRecipe = {
  $meta: {
    name: 'VideoFeedRecipe',
    description: 'Video',
    group: 'environment'
  },
  $stores: {
    isPlaying: {
      $type: 'Boolean'
    },
    boxSelection: {
      $type: 'Box'
    },
    imageRef: {
      $type: 'ImageRef'
    }
  },
  VideoFeed: {
    $container: 'main#buildViewer',
    $kind: 'Media/VideoFeed',
    $inputs: ['isPlaying', 'boxSelection'],
    $outputs: ['imageRef'],
    $slots: {
      overlay: {
        display: {
          $kind: 'Devices/WearableDisplay'
        }
      }
    }
  }
};

export const OverlayFeedRecipe = {
  $meta: {
    description: 'Overlay Feed'
  },
  $stores: {
    imageRef: {
      $type: 'ImageRef'
    },
    classifierResults: {
      $type: '[ClassifierResults]'
    }
  },
  OverlayFeed: {
    $container: 'main#remoteViewer',
    $kind: 'Media/OverlayFeed',
    // $bindings: {
    //   imageRef: '',
    //   classifierResults: ''
    // }
  }
};

export const StaticFeedRecipe = {
  $meta: {
    name: 'StaticFeedRecipe',
    description: 'Images',
    group: 'environment',
    devices: ['builder']
  },
  $stores: {
    imageRef: {
      $type: 'ImageRef'
    },
  },
  StaticFeed: {
    $container: 'main#tools',
    $kind: 'Media/StaticFeed',
    $inputs: ['imageRef'],
    $outputs: ['imageRef'],
  }
};

export const BasicDisplayRecipe = {
  $meta: {
    name: 'BasicDisplayRecipe',
    description: 'Embedded Screen',
    group: 'environment'
  },
  BasicDisplay: {
    $container: 'main#buildViewer',
    $kind: 'Media/BasicDisplay',
    $slots: {
      screen: {}
    }
  }
};

export const VoiceCaptureParticle = {
  $kind: 'Media/VoiceCapture',
  $inputs: ['transcript'],
  $outputs: ['transcript', 'boxSelection'],
  $staticInputs: {
    // phrase: 'capture',
  }
};
