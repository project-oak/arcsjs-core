/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const Holistic = {
  $meta: {
    id: 'Mediapipe Holistic',
    category: 'Model'
  },
  $stores: {
    image: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true,
      connection: true
    },
    outputImage: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    },
    data: {
      $type: 'HolisticData',
      nomonitor: true,
      noinspect: true
    }
  },
  holistic: {
    $kind: 'Mediapipe/Holistic',
    $inputs: ['image'],
    $outputs: ['data']
  }
};

export const MediapipeFaceMesh = {
  $meta: {
    id: 'Mediapipe FaceMesh',
    category: 'Model'
  },
  $stores: {
    image: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true,
      connection: true
    },
    outputImage: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    },
    data: {
      $type: 'FaceData',
      nomonitor: true,
      noinspect: true
    }
  },
  FaceMesh: {
    $kind: 'Mediapipe/FaceMesh',
    $inputs: ['image'],
    $outputs: ['data']
  }
};

export const MediapipeFaceMeshFace = {
  $meta: {
    id: 'FaceMesh',
    category: 'Effect'
  },
  $stores: {
    data: {
      $type: 'FaceData',
      nomonitor: true,
      noinspect: true,
      connection: true
    },
    outputImage: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    }
  },
  FaceMeshFace: {
    $kind: 'Mediapipe/FaceMeshFace',
    $inputs: ['data'],
    $outputs: ['outputImage']
  }
};

export const MediapipeFaceSticker = {
  $meta: {
    id: 'Face Sticker',
    category: 'Effect'
  },
  $stores: {
    data: {
      $type: 'FaceData',
      nomonitor: true,
      noinspect: true,
      connection: true
    },
    index: {
      $type: 'Number',
      range: {min: 0, max: 468, step: 1}
    },
    outputImage: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    },
    sticker: {
      $type: 'Image',
      connection: true
    }
  },
  FaceSticker: {
    $kind: 'Mediapipe/FaceSticker',
    $inputs: ['data', 'sticker', 'index'],
    $outputs: ['outputImage']
  }
};
