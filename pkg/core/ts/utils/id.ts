/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {irand} from "./rand.js";

export const makeId = (pairs?, digits?, delim?) => {
  pairs = pairs || 2;
  digits = digits || 2;
  delim = delim || '-';
  const min = Math.pow(10, digits - 1);
  const range = Math.pow(10, digits) - min;
  const result = [];
  for (let i=0; i < pairs; i++) {
    result.push(`${irand(range - min) + min}`);
  }
  return result.join(delim);
};
