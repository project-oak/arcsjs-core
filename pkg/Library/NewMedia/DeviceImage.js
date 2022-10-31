/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
update({image}) {
  return {output: image}
},
template: html`
<style>
  image-resource {
    width: 100%;
    height: 100%;
  }
</style>
<image-resource image="{{image}}"></image-resource>
`
});
