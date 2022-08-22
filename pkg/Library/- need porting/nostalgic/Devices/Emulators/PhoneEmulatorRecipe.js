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

export const PhoneEmulatorRecipe = {
  $meta: {
    description: 'Red Owl Phone Emulator',
    name: 'smartscreen'
  },
  $stores,
  main: {
    $kind: 'Devices/SmartScreen',
    $slots: {
      // screen
    }
  },
  exchange: {
    ...ActionDriver,
    $staticInputs: {
      device: 'smartscreen'
    }
  }
};
