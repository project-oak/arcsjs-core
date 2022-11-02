/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// KISS solution since our practical problem is exactly here
const alias = {
  'Tensor': 'Image',
  'Image': 'Tensor'
};

// it's unclear to me how declare this formally,
// it's a weird pseudo-thing, it's "works with this kind"
// that why neither & or |
const DELIM = ':';

// once we export the function
// then task one is complete...
//
// plumbing it into arcsjs-support (nee arcsjs-apps)
// is task two
//
// it may seem trivial but I want it to be two
// tasks on purpose, there are considerations
// this code took me an hour or so to get right
// this was the actual task of making 'typeMatcher'
export const typeMatcher = (A, B) => {
  if (A === B || A === alias[B]) {
    return true;
  }
  // we might have a compound type somewhere
  const Aparts = A.split(DELIM);
  const Bparts = B.split(DELIM);
  // if one of these is compound, use the more expensive comparison
  if (Aparts.length > 1 || Bparts.length > 1) {
    return Aparts.includes(B) || Bparts.includes(A) || Aparts.includes(alias[B]) || Bparts.includes(alias[A]);
  }
  // not matching
  return false;
};

// added a test thing, to make sure it worked as expected
// literally pasted this whole module into console to test

const tm = (a, b) => {
  console.log(a, b, typeMatcher(a, b));
};

tm('foo', 'bar');
tm('foo', 'foo');
tm('Tensor', 'Image');
tm('Image', 'Tensor');
tm('Image:Tensor', 'Tensor');
tm('Image:Output', 'Tensor');
tm('Image:Output', 'Output');
tm('Image:Output', 'Image');
tm('Tensor', 'Image:Tensor');
tm('Tensor', 'Image:Output');
tm('Output', 'Image:Output');
tm('Image', 'Tensor:Output');
tm('Image:Output', 'foo');
