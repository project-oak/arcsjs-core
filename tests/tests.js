import {Store} from '../pkg/js/core/Store.js';
import {prepStuff, expectJson} from './utils.js';

const storeTest = async (store, expectedChanges) => {
  // track when the host signals a change
  const changes = await prepStuff(store);
  // set a key: value pair
  store.set('b', 42);
  store.set('b', 42);
  // set an object value
  store.set('obj', {things: 7});
  store.set('obj', {things: 7});
  // set an object value
  store.set('obj', {things: 7});
  store.set('obj', {things: 6});
  // look for it
  return await expectJson(changes, expectedChanges);
};

export const storeTest1 = async () => {
  // define expectation
  const expectedChanges = [
    {value: {
      b: 42
    }},
    {value: {
      b: 42,
      obj: {things: 7}
    }},
    {value: {
      b: 42,
      obj: {things: 6}
    }}
  ];
  // test a Store
  return await storeTest(new Store(), expectedChanges);
};

export const storeTest2 = async () => {
  // define expectation
  const expectedChanges = [
    {value: {
      b: 42
    }},
    {value: {
      b: 42,
      obj: {things: 7}
    }},
    {value: {
      b: 42,
      obj: {things: 2}
    }}
  ];
  // test a Store
  return await storeTest(new Store(), expectedChanges);
};
