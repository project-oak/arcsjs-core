/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import './quagga.min.js';
const {Quagga} = window;

// Quagga reader names
//
// code_128_reader (default)
// ean_reader
// ean_8_reader
// code_39_reader
// code_39_vin_reader
// codabar_reader
// upc_reader
// upc_e_reader
// i2of5_reader
// 2of5_reader
// code_93_reader
// code_32_reader

export class QuaggaService {
  static async receive({msg, data}) {
    return this[msg]?.(data);
  }
  static async decode({src, readers}) {
    return new Promise((resolve, reject) => {
      const config = {
        src,
        decoder: {
          readers: readers || ["upc_reader"]
        }
      };
      const handler = result => {
        resolve(result?.codeResult ? [result?.codeResult.code] : null);
      };
      Quagga.decodeSingle(config, handler);
    });
  }
}