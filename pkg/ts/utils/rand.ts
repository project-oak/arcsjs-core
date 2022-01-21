/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const {floor, pow, random} = Math;

// random n-digit number
export const key = (digits: number) => floor((1 + random() * 9) * pow(10, digits - 1));

// random integer from [0..range)
export const irand = (range: number) => floor(random()*range);

// random element from array
export const arand = (array: any[]) => array[irand(array.length)];

// test if event has occured, where `probability` is between [0..1]
export const prob = (probability: number) => Boolean(random() < probability);
