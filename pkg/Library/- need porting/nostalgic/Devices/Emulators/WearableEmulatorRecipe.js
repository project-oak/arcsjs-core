/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {actionStores} from '../../Actions/actionStores.js';
import {ActionDriver} from '../../Actions/ActionDriverRecipe.js';

const $stores = {
  transcript: {
    $type: 'Transcript'
  },
  ...actionStores
};

export const WearableEmulatorRecipe = {
  $meta: {
    description: 'Wearable Emulator',
    name: 'Wearable'
  },
  $stores,
  main: {
    $kind: 'Devices/Emulators/WearableEmulator',
    $slots: {
      wearable: {
        display: {
          $kind: 'Devices/WearableDisplay',
          $slots: {
            // screen
          }
        }
      }
    }
  },
  exchange: {
    ...ActionDriver,
    $staticInputs: {
      device: 'wearables'
    }
  }
};
