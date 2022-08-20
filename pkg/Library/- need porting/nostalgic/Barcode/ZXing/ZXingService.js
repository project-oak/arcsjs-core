/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import './zxing.min.js';

const hints = new Map();
// Optimize for accuracy, not speed.
hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
const decoder = new ZXing.BrowserMultiFormatReader(hints);

export class ZXingService {
  static async receive({msg, data}) {
    return this[msg]?.(data);
  }
  static async decode(src) {
    return new Promise((resolve, reject) => {
      decoder.decodeFromImageUrl(src).then((result) => {
        resolve(result ? [result.text] : null);
      }).catch((e) => {
        // ZXing throws a NotFoundException whenever it cannot
        // detect a barcode. Avoid logging these.
        if (!(e instanceof ZXing.NotFoundException)) {
          console.log(e);
        }
        resolve(null);
      });
    });
  }
}