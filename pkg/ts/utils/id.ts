/**
 * @license
 * Copyright 2020 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
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
