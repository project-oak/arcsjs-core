/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Xen} from '../../Dom/xen/xen-async.js';

const {BarcodeDetector} = window;

class BarcodeDetectorElement extends Xen.Async {
  static get observedAttributes() {
    return ['src'];
  }
  update({src}) {
    if (src) {
      this.detect(src);
    }
  }
  detect(src) {
    const barcodeDetector = new BarcodeDetector({
      // (Optional) A series of barcode formats to search for.
      // Not all formats may be supported on all platforms
      formats: [
        'aztec',
        'code_128',
        'code_39',
        'code_93',
        'codabar',
        'data_matrix',
        'ean_13',
        'ean_8',
        'itf',
        'pdf417',
        'qr_code',
        'upc_a',
        'upc_e'
      ]
    });
    const image = new Image();
    image.onload = async () => {
      this.value = await barcodeDetector.detect(image);
      this.fire('barcodes', this.value);
    };
    image.src = src;
  }
}

window.customElements.define('barcode-detector', BarcodeDetectorElement);