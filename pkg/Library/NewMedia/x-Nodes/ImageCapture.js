/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const ImageCaptureObject = {
  $meta: {
    name: 'ImageCapture',
    category: 'Media'
  },
  $stores: {
    fps: {
      $type: 'Number',
      $value: 30
    },
    stream: {
      $type: 'Stream',
      connection: true
    },
    frame: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    }
  },
  field: {
    $kind: '$library/NewMedia/ImageCapture',
    $inputs: ['stream', 'fps'],
    $outputs: ['frame']
  }
};