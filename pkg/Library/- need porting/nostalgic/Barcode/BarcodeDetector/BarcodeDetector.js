/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
render({imageRef}) {
  return {
    imageRef
  };
},
onBarcodes({eventlet: {value}}) {
  log(value);
},
template: html`
<style>
  :host {
    display: none !important;
  }
</style>
<barcode-detector on-barcodes="onBarcodes" src="{{imageRef}}"></barcode-detector>
`
});
