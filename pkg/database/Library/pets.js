/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const pets = [{
  id: 'Zuko',
  name: 'Zuko',
  kind: 'cat',
  age: 2,
}, {
  id: 'Gracie',
  name: 'Gracie',
  kind: 'dog',
  age: 5,
}];

export const petProps = {
  name: {
    type: 'String',
    mandatory: true
  },
  kind: {
    type: 'String',
    values: ['dog', 'cat', 'bunny', 'bird', 'other'],
    default: 'other',
    mandatory: true
  },
  age: {
    type: 'Number',
    min: 0,
    max: 100,
    default: 0,
    mandatory: true
  },
  image: {
    type: 'Image',
  }
};

export const petFormParticleKind = '$db/PetForm';
