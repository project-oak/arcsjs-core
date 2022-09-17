/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const GoogleMap = {
  $meta: {
    name: 'Google Maps',
    category: 'Panels'
  },
  $stores: {
    geolocation: {
      $type: 'Geolocation',
      $value: {
        latitude: 38.1904808,
        longitude: -122.2901155
      }
    }
  },
  locator: {
    $kind: '$library/Geolocation/Geolocation',
    $outputs: ['geolocation']
  },
  map: {
    $kind: '$library/Goog/GoogleMap',
    $inputs: ['geolocation']
  }
};

