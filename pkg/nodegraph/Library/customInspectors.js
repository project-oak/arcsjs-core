/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const customInspectors = {
  MyTestObject: {
    $meta: {name: 'custom inspect MyTestObject'},
    inspect: {
      $kind: '$app/nodegraph/Library/Inspectors/MyTestObjectInspect',
    }
  }
};
