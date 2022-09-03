/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
shouldRender({geolocation}) {
  return Boolean(geolocation);
},
render({geolocation: {latitude, longitude}}) {
  return {latitude, longitude};
},
template: html`
<good-map flex zoom="12" latitude$="{{latitude}}" longitude$="{{longitude}}"></good-map>
`
});
