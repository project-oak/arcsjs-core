/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
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