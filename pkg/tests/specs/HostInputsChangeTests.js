/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Arc, Host, Store, utils} from '../../arcs.js';
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
    const host = new Host();
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

export const hostInputsChangeTest = async () => {
  // make a store
  const store = new Store();
  // create a test application
  const app = new AppClass();
  // test application will observe onStoreChange events sent to Host (?)
  const changes = await app.init(store);
  // set a key: value pair twice, second change should be filtered
  store.set('b', 42);
  store.set('b', 42);
  // set an Object value twice, second change should be filtered
  store.set('obj', {things: 7});
  store.set('obj', {things: 7});
  // sub-property change
  store.set('obj', {things: 6});
  // set an Array value twice, second change should be filtered
  store.set('arr', [0, 1, 2]);
  store.set('arr', [0, 1, 2]);
  // test that change-detection is deep (reference independent)
  const arr = [0, 1, 2];
  store.set('arr', arr);
  arr.push(3);
  store.set('arr', arr);
  // capture operations
  await waitFor(100);
  const actualChanges = changes.finalize();
  // define expectations
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
    }},
    {value: {
      b: 42,
      obj: {things: 6},
      arr: [0, 1, 2]
    }},
    {value: {
      b: 42,
      obj: {things: 6},
      arr: [0, 1, 2, 3]
    }}
  ];
  return await checkState(
    actualChanges,
    expectedChanges
  );
};

// export const NullStartupState = () => StartupState('{}');