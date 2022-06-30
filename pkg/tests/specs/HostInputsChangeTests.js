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
    const changes = [];
    host.listen(
      'inputs-changed',
      () => {
        //sysLog('Host:inputs-changed:', JSON.stringify(host.particle.inputs, null, '  '));
        changes.push(utils.deepCopy(host.particle.inputs));
      },
      'ahoy'
    );
    changes.disposeListener = () => host.unlisten('inputs-changed', 'ahoy');
    changes.finalize = () => (changes.disposeListener(), [...changes]);
    return changes;
  }
};

const HostInputsTest = class {
  constructor() {
    this.store = new Store();
    this.expectations = [];
  }
  async init() {
    // create a test application
    const app = new AppClass();
    // test application will observe onStoreChange events sent to Host (?)
    this.changes = await app.init(this.store);
  }
  capture(key, value) {
    this.store.set(key, value);
    this.expectations.push({
      'value': {
        ...(this.expectations.length > 0 && this.expectations[this.expectations.length - 1].value),
        [key]: this.formatValue(value)
      }
    });
  }
  formatValue(value) {
    return (value === Object(value)) 
      ? Array.isArray(value) ? [...value] : {...value}
      : value;
  }
  ignore(key, value) {
    this.store.set(key, value);
    // this.value = value;
  }
  async validate() {
    await waitFor(100);
    const actualChanges = this.changes.finalize();
    // console.log(`******  ${JSON.stringify(actualChanges)}`);
    // console.log(`******??  ${JSON.stringify(this.expectations)}`);
    return await checkState(actualChanges, this.expectations);
  }
};

export const hostInputsChangeTest = async () => {
  const test = new HostInputsTest();
  await test.init();
  // set a key: value pair twice, second change should be filtered
  test.capture('b', 42);
  test.ignore('b', 42);

  // set an Object value twice, second change should be filtered
  test.capture('obj', {things: 7});
  test.ignore('obj', {things: 7});

  // sub-property change
  test.capture('obj', {things: 6});

  // set an Array value twice, second change should be filtered
  test.capture('arr', [0, 1, 2]);
  test.ignore('arr', [0, 1, 2]);

  // test that change-detection is deep (reference independent)
  const arr = [0, 1, 2];
  test.ignore('arr', arr);

  arr.push(3);
  test.capture('arr', arr);

  // capture operations
  return await test.validate();
};

export const hostInputChangeTest_object_fieldChanged1 = async () => {
  const test = new HostInputsTest();
  await test.init();

  const object = {hello: 'world'};
  test.capture('object', object);
  test.ignore('object', object);
  test.ignore('object', {hello: 'world'});

  object.b = [1, 2, 3];
  test.ignore('object', object);

  object.b.push(4);
  test.ignore('object', object);

  return await test.validate();
}; 


export const hostInputChangeTest_object_cloned = async () => {
  const test = new HostInputsTest();
  await test.init();

  const object = {hello: 'world'};
  test.capture('object', object);

  object.foo = 'bar';
  test.ignore('object', object);

  test.capture('object', {...object, foo: 'qux'});

  return await test.validate();
};
