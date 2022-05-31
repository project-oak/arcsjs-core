/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Store} from '../../arcs-import.js';
import {waitFor, checkState, getTestState, getTestInjections} from '../lib/test-utils.js';
import {LocalStoragePersistor} from '../lib/local-storage-persistor.js';

const eq = (a, b) => ({pass: a === b, value: a, expected: b});

export const persistorSmokeTest = async () => {
  // create a store
  const store = new Store();
  // choose a random value
  const random = Math.random();
  // set a key/value pair
  store.set('random', random);
  // create a persistor
  const persistor = new LocalStoragePersistor('test:arcs-core:persist-test');
  // persist the data
  persistor.persist('test', store);
  // create a new store
  const store2 = new Store();
  // restore the data
  await persistor.restore('test', store2);
  // test results
  return eq(store2.data.random, random);
};

export const autoPersistorTest = async () => {
  // create a persistor
  const persistor = new LocalStoragePersistor('test:arcs-core:persist-test');
  // create a store
  const store = new Store();
  store.listen('change', store => {
    // persist the data
    persistor.persist('test', store);
  });
  // choose a random value
  const random = -Math.random();
  // set a key/value pair
  store.set('random', random);
  //
  // create a new store
  const store2 = new Store();
  // restore the data
  await persistor.restore('test', store2);
  // test results
  return eq(store2.data.random, random);
};

export const guidPersistorTest = async () => {
  // factory to create a persistable store
  const create = async (guid, persistor, value) => {
    const store = new Store();
    await persistor.restore(guid, store, value);
    store.listen('change', store => {
      // persist the data
      persistor.persist(guid, store);
    });
    return store;
  };
  // create a persistor
  const persistor = new LocalStoragePersistor('test:arcs-core:persist-test');
  // create a store
  const store = await create('store-0', persistor);
  // choose a random value
  const random = -Math.random();
  // set a key/value pair
  store.set('random', random);
  //
  // create another instance
  const store2 = await create('store-0', persistor);
  // test that the data was persisted
  return eq(store2.data.random, random);
};