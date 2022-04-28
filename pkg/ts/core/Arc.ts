/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {EventEmitter} from './EventEmitter.js';
import {Host} from './Host.js';
import {logFactory} from '../utils/log.js';
import {ArcMeta} from './types.js';
import {Store} from './Store.js';

const customLogFactory = (id: string) => logFactory(logFactory.flags.arc, `Arc (${id})`, 'slateblue');

const {keys, entries, values, create} = Object;
const nob = () => create(null);

export class Arc extends EventEmitter {
  log;
  id;
  meta: ArcMeta;
  stores: Store[];
  hosts;
  surface;
  composer;
  hostService;
  constructor(id, meta: ArcMeta, surface) {
    super();
    this.id = id;
    this.meta = meta;
    this.surface = surface;
    this.hosts = nob();
    this.stores = nob();
    this.log = customLogFactory(id);
  }
  async addHost(host: Host, surface?) {
    // to support hosts we need a composer
    await this.ensureComposer();
    // bookkeep
    this.hosts[host.id] = host;
    host.arc = this;
    // support per host surfacing?
    //await host.bindToSurface(surface ?? this.surface);
    // begin work
    this.updateHost(host);
    return host;
  }
  async ensureComposer() {
    if (!this.composer && this.surface) {
      // create composer
      this.composer = await this.surface.createComposer('root');
      // pipeline for events from composer to this.onevent
      // TODO(sjmiles): use 'bind' to avoid a closure and improve the stack trace
      this.composer.onevent = this.onevent.bind(this);
    }
  }
  removeHost(id) {
    this.hosts[id]?.detach();
    delete this.hosts[id];
  }
  addStore(storeId, store) {
    if (store && !this.stores[storeId]) {
      this.stores[storeId] = store;
      store.listen('change', () => this.storeChanged(storeId, store));
    }
  }
  removeStore(storeId) {
    if (this.stores[storeId]) {
      // TODO(sjmiles): must `unlisten` to match `listen` above
      //this.stores[storeId].onChange = null;
    }
    delete this.stores[storeId];
  }
  // TODO(sjmiles): 2nd param is used in overrides, make explicit
  protected storeChanged(storeId, store) {
    this.log(`storeChanged: "${storeId}"`);
    values(this.hosts).forEach((host: Host) => {
      const bindings = host.meta?.bindings;
      const inputs = host.meta?.inputs;
      const isBoundBackwardCompatible = (bindings) => bindings && entries(bindings).some(([n, v]) => (v || n) === storeId);
      const isBound = (inputs) => inputs && inputs.some(input => values(input)[0] == storeId || keys(input)[0] == storeId);
      if (isBoundBackwardCompatible(bindings) || isBound(inputs)) {
        this.log(`host "${host.id}" has interest in "${storeId}"`);
        // TODO(sjmiles): we only have to update inputs for storeId, we lose efficiency here
        this.updateHost(host);
      }
    });
    this.fire('store-changed', storeId);
  }
  updateHost(host) {
    host.inputs = this.computeInputs(host);
  }
  // TODO(sjmiles): debounce? (update is sync-debounced already)
  // complement to `assignOutputs`
  protected computeInputs(host) {
    const inputs = nob();
    const bindings = host.meta?.bindings;
    const inputBindings = host.meta?.inputs;
    const staticInputs = host.meta?.staticInputs;
    if (bindings) {
      keys(bindings).forEach(name => this.computeInputBackwardCompatibile(name, bindings, staticInputs, inputs));
    }
    if (inputBindings) {
      inputBindings.forEach(input => this.computeInput(entries(input)[0], staticInputs, inputs));
    }
    if (bindings || inputBindings) {
      this.log(`computeInputs(${host.id}) =`, inputs);
    }
    return inputs;
  }
  protected computeInputBackwardCompatibile(name, bindings, staticInputs, inputs) {
    // TODO(sjmiles): implement _conditional_ bindings that are dynamic at runtime to allow directing data flow (c.f. FooImageRef)
    const storeName = bindings[name] || name;
    // find referenced store
    const store = this.stores[storeName];
    if (store) {
      //this.log(`computeInputs: using "${storeName}" (bound to "${name}")`);
      inputs[name] = store.pojo;
    } else {
      this.log.error(`computeInput: "${storeName}" (bound to "${name}") not found`);
    }
    if (!(inputs[name]?.length > 0) && staticInputs?.[name]) {
      inputs[name] = staticInputs[name];
    }
  }
  protected computeInput([name, binding], staticInputs, inputs) {
    const storeName = binding || name;
    // TODO(sjmiles): implement _conditional_ bindings that are dynamic at runtime to allow directing data flow (c.f. FooImageRef)
    // find referenced store
    const store = this.stores[storeName];
    if (store) {
      //this.log(`computeInputs: using "${storeName}" (bound to "${name}")`);
      inputs[name] = store.pojo;
    } else {
      this.log.error(`computeInput: "${storeName}" (bound to "${name}") not found`);
    }
    if (!(inputs[name]?.length > 0) && staticInputs?.[name]) {
      inputs[name] = staticInputs[name];
    }
  }
  // complement to `computeInputs`
  assignOutputs({id, meta}, outputs) {
    const names = keys(outputs);
    if ((meta?.bindings || meta?.outputs) && names.length) {
      //this.log.group(`assignOutputs(${host.id}, {${keys}})`);
      //this.log(`[start][${id}] assignOutputs({${names}})`);
      names.forEach(name => this.assignOutput(name, this.stores, outputs[name], meta.bindings, meta.outputs));
      //this.log.groupEnd();
      this.log(`[end][${id}] assignOutputs:`, outputs);
    }
  }
  protected assignOutput(name, stores, output, bindings, outputs) {
    if (output !== undefined) {
      const binding = bindings?.[name] || this.findOutputByName(outputs, name) || name;
     // this.log(`assignOutputs: property "${name}" is bound to store "${binding}"`);
      const store = stores[binding];
      if (!store) {
        if (bindings?.[name] || outputs?.[name]) {
          this.log.warn(`assignOutputs: no "${binding}" store for output "${name}"`);
        }
      } else {
        // Note: users can mess up output data in any way they see fit, so we should
        // probably invent `outputCleansing`.
        this.log(`assignOutputs: "${name}" is dirty, updating Store "${binding}"`, output);
        store.data = output;
      }
    }
  }
  findOutputByName(outputs, name) {
    const output = outputs?.find(output => keys(output)[0] === name);
    if (output) {
      return values(output)[0];
    }
  }
  async render(packet) {
    if (this.composer) {
      this.composer.render(packet);
    } else {
      //this.log.low('render called, but composer is null', packet);
    }
  }
  onevent(pid, eventlet) {
    const host = this.hosts[pid];
    if (host) {
      host.handleEvent(eventlet);
    }
  }
  async service(host, request) {
    let result = await this.surface?.service(request);
    if (result === undefined) {
      result = this.hostService?.(host, request);
    }
    return result;
  }
}
