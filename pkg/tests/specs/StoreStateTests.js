/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Store} from '../../arcs-import.js';
import {stateCapture, checkState} from '../lib/test-utils.js';

export const testStoreState = async () => {
  // create a store
  const store = new Store();
  // set a key: value pair
  store.set('b', 42);
  store.set('b', 42);
  // set an object value
  store.set('obj', {things: 7});
  store.set('obj', {things: 7});
  // set an object value
  store.set('obj', {things: 7});
  store.set('obj', {things: 6});
  // what we expect
  const expectedState = JSON.stringify({
    store: {
      meta: {
      },
      value: {
        b:42,
        obj: {
          things:6
        }
      }
    }
  });
  // test
  return checkState(stateCapture({store}), expectedState);
};
