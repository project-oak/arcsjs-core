/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

render({Geolocation}) {
  if (Geolocation) {
    const {latitude, longitude} = Geolocation;
    return {latitude, longitude};
  }
},

template: html`
  <style>
    :host {
      height: 300px;
    }
  </style>
  <good-map zoom="12" latitude$="{{latitude}}" longitude$="{{longitude}}"></good-map>
`
});
