/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Arc, Host, Store, utils} from '../../arcsjs-core.js';
import {waitFor, checkState} from '../lib/test-utils.js';

const {create, entries} = Object;

// create a dummy Particle
const dummicle = {
  meta: {
    bindings: {
      value: 'itisstore'
    }
  },
  internal: {
    inputs: {}
  },
  get inputs() {
    return this.internal.inputs;
  },
  set inputs(inputs) {
    const clones = create(null);
    // shallow-clone Object|Array values in inputs
    entries(inputs).forEach(([key, value]) => {
      if (value && (typeof value === 'object')) {
        clones[key] = Array.isArray(value) ? [...value] : {...value};
      } else if (value !== undefined) {
        clones[key] = value;
      }
    });
    // these clones is them inputs
    this.internal.inputs = clones;
  }
};

const AppClass = class {
  async init(store) {
    // create an Arc
    const arc = new Arc('arc');
    // the Arc can call the store whatever it wants
    arc.addStore('itisstore', store);
    // construct a Host, attach a dummy Particle
    const host = new Host('testHost');
    host.meta = dummicle.meta;
    host.particle = dummicle;
    // add `host` to `arc`
    await arc.addHost(host);
    // track when the host signals a change
    this.changes = [];
    host.listen(
      'inputs-changed',
      () => {
        //sysLog('Host:inputs-changed:', JSON.stringify(host.particle.inputs, null, '  '));
        this.changes.push(utils.deepCopy(host.particle.inputs));
      },
      'ahoy'
    );
    this.changes.disposeListener = () => host.unlisten('inputs-changed', 'ahoy');
    this.changes.finalize = () => (this.changes.disposeListener(), [...this.changes]);
  }
};

export const hostInputsChangeTest = async () => {
  // make a store
  const store = new Store();
  // create a test application
  const app = new AppClass();
  // test application will observe onStoreChange events sent to Host (?)
  await app.init(store);

  // set a key: value pair twice, second change should be filtered
  store.set('b', 42);
  store.set('b', 42);

  // set an Object value twice, second change should be filtered
  store.set('obj', {things: 7});
  store.set('obj', {things: 7});

  // // sub-property change
  store.set('obj', {things: 6});

  // set an Array value twice, second change should be filtered
  store.set('arr', [0, 1, 2]);
  store.set('arr', [0, 1, 2]);

  // test that change-detection is deep (reference independent)
  const arr = [0, 1, 2];
  store.set('arr', arr);
  arr.push(3);
  store.set('arr', arr);

  await waitFor(100);
  const actualChanges = app.changes.finalize();
  const expectedChanges = [
    {value: {'b': 42}},
    {value: {'b': 42, 'obj': {things: 7}}},
    {value: {'b': 42, 'obj': {things: 6}}},
    {value: {'b': 42, 'obj': {things: 6}, arr: [0, 1, 2]}},
    {value: {'b': 42, 'obj': {things: 6}, arr: [0, 1, 2, 3]}}
  ];
  return await checkState(actualChanges, expectedChanges);
};

export const hostInputChangeTest_fieldChange_ignore = async () => {
  const store = new Store();
  const app = new AppClass();
  await app.init(store);

  const object = {hello: 'world'};
  store.set('object', object);

  // A field in an unchanged object is set, no update.
  object.foo = 'bar';
  store.set('object', object);

  await waitFor(100);
  const actualChanges = app.changes.finalize();
  const expectedChanges = [
    {value: {'object': {hello: 'world'}}}
  ];
  return await checkState(actualChanges, expectedChanges);
};

export const hostInputChangeTest_clonedObjectFieldChange_capture = async () => {
  const store = new Store();
  const app = new AppClass();
  await app.init(store);

  const object = {hello: 'world'};
  store.set('object', object);

  // Object is cloned and a field.
  store.set('object', {...object, foo: 'bar'});

  await waitFor(100);
  const actualChanges = app.changes.finalize();
  const expectedChanges = [
    {value: {'object': {hello: 'world'}}},
    {value: {'object': {hello: 'world', foo: 'bar'}}}
  ];
  return await checkState(actualChanges, expectedChanges);
};

export const hostInputChangeTest_clonedObjectNestedFieldChange_ignore = async () => {
  const store = new Store();
  const app = new AppClass();
  await app.init(store);

  const object = {hello: {'hi': 'hola'}};
  store.set('object', object);

  // Clone the object and change a nested field.
  const cloned = {...object};
  cloned.hello.hi = 'shalom';

  store.set('object', cloned);

  await waitFor(100);
  const actualChanges = app.changes.finalize();
  const expectedChanges = [
    {value: {'object': {hello: {'hi': 'hola'}}}}
  ];
  return await checkState(actualChanges, expectedChanges);
};

export const hostInputChangeTest_listUpdate_ignored = async () => {
  const store = new Store();
  const app = new AppClass();
  await app.init(store);

  const list = ['one', 'two', 'three'];
  store.set('list', list);

  list[1] = 'two two';
  store.set('list', list);
  list.push('four');
  store.set('list', list);

  await waitFor(100);
  const actualChanges = app.changes.finalize();
  const expectedChanges = [
    {value: {'list': ['one', 'two', 'three']}}
  ];
  return await checkState(actualChanges, expectedChanges);
};

export const hostInputChangeTest_clonedListUpdate_captured = async () => {
  const store = new Store();
  const app = new AppClass();
  await app.init(store);

  const list = ['one', 'two', 'three'];
  store.set('list', list);

  store.set('list', [...list, 'four']);

  await waitFor(100);
  const actualChanges = app.changes.finalize();
  const expectedChanges = [
    {value: {'list': ['one', 'two', 'three']}},
    {value: {'list': ['one', 'two', 'three', 'four']}}
  ];
  return await checkState(actualChanges, expectedChanges);
};

export const hostInputChangeTest_clonedNestedListUpdate_ignored = async () => {
  const store = new Store();
  const app = new AppClass();
  await app.init(store);

  const object = {'one': 1, 'two': [2, 22, 222], three: 3};
  store.set('object', object);

  object.two.push(2222);
  store.set('object', {...object});

  await waitFor(100);
  const actualChanges = app.changes.finalize();
  const expectedChanges = [
    {value: {'object': {'one': 1, 'two': [2, 22, 222], three: 3}}}
  ];
  return await checkState(actualChanges, expectedChanges);
};

export const hostInputChangeTest_clonedNestedListUpdate_captured = async () => {
  const store = new Store();
  const app = new AppClass();
  await app.init(store);

  const object = {'one': 1, 'two': [2, 22, 222], three: 3};
  store.set('object', object);

  store.set('object', {...object, two: [...object.two, 2222]});

  await waitFor(100);
  const actualChanges = app.changes.finalize();
  const expectedChanges = [
    {value: {'object': {'one': 1, 'two': [2, 22, 222], three: 3}}},
    {value: {'object': {'one': 1, 'two': [2, 22, 222, 2222], three: 3}}}
  ];
  return await checkState(actualChanges, expectedChanges);
};