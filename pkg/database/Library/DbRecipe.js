/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
const pets = [{
  name: 'Zuko',
  kind: 'cat',
  age: 2,
  pic: '../../z.png'
}, {
  name: 'Gracie',
  kind: 'dog',
  age: 5,
  pic: '../../g.png'
}];

export const DbRecipe = {
  $meta: {
    description: 'Arcs Database Recipe'
  },
  $stores: {
    records: {
      $type: '[Pojo]',
      $value: pets
    }
  },
  database: {
    $kind: '$db/DbHome',
    $slots: {
      recordsViewer: {
        RecordsViewer: {
          $kind: '$db/PetsViewer',
          $inputs: ['records'],
          $outputs: ['records'],
          $slots: {
            new: {
              PetCreator: {
                $kind: '$db/PetForm',
                $inputs: ['records'],
                $outputs: ['records']
              }
            }
          }
        }
      }
    }
  }
};