/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const Geolocation = {
  $meta: {
    name: 'Get Geo location',
    category: 'fun'
  },
  $stores: {
    Geolocation: {
      $type: 'Geolocation',
    }
  },
  Geolocation: {
    $kind: 'nostalgic/Goog/Geolocation',
    $outputs: ['Geolocation']
  }
};

export const ShowGeolocation = {
  $meta: {
    name: 'Show Geo location',
    category: 'fun'
  },
  $stores: {
    Geolocation: {
      $type: 'Geolocation',
      connection: true,
    }
  },
  showlocation: {
    $kind: 'nostalgic/Goog/ShowGeolocation',
    $inputs: ['Geolocation']
  }
};
