/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const RapsaiImagesNode = {
  $meta: {
    id: 'RapsaiImages',
    displayName: 'Rapsai Images',
    category: 'Rapsai'
  },
  $stores: {
    urls: {
      $type: '[ImageURL]',
      $value: [
        'https://storage.googleapis.com/tfweb/testpics/pose1.jpg',
        'https://storage.googleapis.com/tfweb/testpics/dog.jpeg',
        'https://storage.googleapis.com/tfweb/testpics/strawberry2.jpeg',
        "https://arcsjs.web.app/assets/kitten.jpeg",
        "https://arcsjs.web.app/assets/corgi.jpeg",
        "https://arcsjs.web.app/assets/black-widow.jpeg",
      ]
    },
    selectedUrl: {
      $type: 'ImageURL',
      nodisplay: true
    },
    image: {
      $type: 'Image',
      noinspect: true,
      nomonitor: true
    }
  },
  inputImage: {
    $kind: '$rapsai/Library/InputImage',
    $inputs: ['urls', 'selectedUrl'],
    $outputs: ['selectedUrl', 'image']
  }
};
