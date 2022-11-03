/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

 const pets = [{
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

// TODO(mariakleiner): convert to props map (with type, default value,
// whether mandatory, etc).
const petProps = ['name', 'kind', 'age', 'image'];

const petFormParticleKind = '$db/PetForm';
