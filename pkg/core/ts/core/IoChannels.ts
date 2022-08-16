/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {Store} from './Store.js';

const {assign, entries, keys, values, create} = Object;

const nob = () => create(null);

export const InputChannel = class {
  static computeInputs(stores: Store[], meta) {
    const inputs = nob();
    const staticInputs = meta?.staticInputs;
    assign(inputs, staticInputs);
    const inputBindings = meta?.inputs;
    if (inputBindings ===  '*') {
      // TODO(sjmiles): we could make the contract that the bindAll inputs are
      // names (or names + meta) only. The Particle could look up values via
      // service (to reduce throughput requirements)
      entries(stores).forEach(([name, store]) => inputs[name] = store.pojo);
    } else {
      if (inputBindings) {
        inputBindings.forEach(input => this.computeInput(stores, entries(input)[0], inputs));
      }
    }
    return inputs;
  }
  static computeInput(stores, [name, binding], inputs) {
    const storeName = binding || name;
    const store = stores[storeName];
    if (store) {
      inputs[name] = store.pojo;
    } else {
      //this.log.warn(`computeInput: "${storeName}" (bound to "${name}") not found`);
    }
  }
};

export const OutputChannel = class {
  // complement to `computeInputs`
  static assignOutputs(stores, {id, meta}, outputs) {
    const names = keys(outputs);
    if (meta?.outputs && names.length) {
      names.forEach(name =>
        this.assignOutput(stores, name, outputs[name], meta.outputs)
      );
      //this.log(`[end][${id}] assignOutputs:`, outputs);
    }
  }
  static assignOutput(stores, name, output, outputs) {
    if (output !== undefined) {
      const binding = this.findOutputByName(outputs, name) || name;
      const store = stores[binding];
      if (!store) {
        if (outputs?.[name]) {
          //this.log.warn(`assignOutputs: no "${binding}" store for output "${name}"`);
        }
      } else {
        // Note: users can mess up output data in any way they see fit, so we should
        // probably invent `outputCleansing`.
        //this.log(`assignOutputs: "${name}" is dirty, updating Store "${binding}"`, output);
        store.data = output;
      }
    }
  }
  static findOutputByName(outputs, name) {
    const output = outputs?.find(output => output[name]);
    return output?.[name];
    // const output = outputs?.find(output => keys(output)[0] === name);
    // if (output) {
    //   return values(output)[0];
    // }
  }
};