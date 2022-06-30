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
    this.expectations = [];
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

  expect(values) {
    this.expectations.push(...values.map(value => ({value})));
  }

  async validate() {
    await waitFor(100);
    const actualChanges = this.changes.finalize();
    return await checkState(actualChanges, this.expectations);
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

  app.expect([
    {'b': 42},
    {'b': 42, 'obj': {things: 7}},
    {'b': 42, 'obj': {things: 6}},
    {'b': 42, 'obj': {things: 6}, arr: [0, 1, 2]},
    {'b': 42, 'obj': {things: 6}, arr: [0, 1, 2, 3]}
  ]);

  // capture operations
  return await app.validate();
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

  app.expect([{'object': {hello: 'world'}}]);
  return await app.validate();
};

export const hostInputChangeTest_clonedObjectFieldChange_capture = async () => {
  const store = new Store();
  const app = new AppClass();
  await app.init(store);

  const object = {hello: 'world'};
  store.set('object', object);

  // Object is cloned and a field.
  store.set('object', {...object, foo: 'bar'});

  app.expect([
    {'object': {hello: 'world'}},
    {'object': {hello: 'world', foo: 'bar'}}
  ]);
  return await app.validate();
};
