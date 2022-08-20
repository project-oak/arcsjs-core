/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const InputNode = {
  $meta: {
    name: 'Input',
    category: 'input'
  },
  $stores: {
    frame: {
      $type: 'Frame',
      noinspect: true
    }
  },
  input: {
    $outputs: ['frame']
  }
};

export const Effect = {
  $meta: {
    name: 'Effect',
    category: 'effect',
  },
  $stores: {
    frame: {
      $type: 'Frame',
      connection: true
    },
    outputFrame: {
      $type: 'Frame',
      noinspect: true
    }
  },
  effect: {
    $inputs: ['frame'],
    $outputs: ['outputFrame']
  }
};

export const Output = {
  $meta: {
    name: 'Output',
    category: 'output',
  },
  $stores: {
    frame: {
      $type: 'Frame',
      connection: true
    }
  },
  effect: {
    $inputs: ['frame']
  }
};