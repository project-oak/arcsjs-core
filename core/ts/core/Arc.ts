/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {EventEmitter} from './EventEmitter.js';
import {Host} from './Host.js';
import {logFactory} from '../utils/log.js';
import {Dictionary, ArcMeta} from './types.js';
import {Store} from './Store.js';

const customLogFactory = (id: string) => logFactory(logFactory.flags.arc, `Arc (${id})`, 'slateblue');

const {assign, create} = Object;
const entries = (o):any[] => Object.entries(o ?? Object);
const keys = (o):any[] => Object.keys(o ?? Object);
const values = (o):any[] => Object.values(o ?? Object);
const nob = () => create(null);

export class Arc extends EventEmitter {
  log;
  id;
  meta: ArcMeta;
  stores: Store[];
  hosts: Dictionary<Host>;
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
    // TODO(sjmiles): support per host surfacing?
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
  rerender() {
    values(this.hosts).forEach(h => h.rerender());
  }
  removeHost(id) {
    this.hosts[id]?.detach();
    delete this.hosts[id];
  }
  addStore(storeId, store) {
    if (store && !this.stores[storeId]) {
      this.stores[storeId] = store;
      store.listen('change', () => this.storeChanged(storeId, store), this.id);
    }
  }
  removeStore(storeId) {
    const store = this.stores[storeId];
    if (store) {
      store.unlisten('change', this.id);
    }
    delete this.stores[storeId];
  }
  // TODO(sjmiles): 2nd param is used in overrides, make explicit
  protected storeChanged(storeId, store) {
    this.log(`storeChanged: "${storeId}"`);
    const isBound = inputs => inputs && inputs.some(input => input && (values(input)[0] == storeId || keys(input)[0] == storeId));
    values(this.hosts).forEach(host => {
      const inputs = host.meta?.inputs;
      if (inputs === '*' || isBound(inputs)) {
        this.log(`host "${host.id}" has interest in "${storeId}"`);
        // TODO(sjmiles): we only have to update inputs for storeId, we lose efficiency here
        this.updateHost(host);
      }
    });
    this.fire('store-changed', storeId);
  }
  updateParticleMeta(hostId, meta) {
    const host = this.hosts[hostId];
    host.meta = meta;
    this.updateHost(host);
  }
  updateHost(host) {
    host.inputs = this.computeInputs(host);
  }
  // TODO(sjmiles): debounce? (update is sync-debounced already)
  // complement to `assignOutputs`
  protected computeInputs(host) {
    const inputs = nob();
    const inputBindings = host.meta?.inputs;
    if (inputBindings ===  '*') {
      // TODO(sjmiles): we could make the contract that the bindAll inputs are
      // names (or names + meta) only. The Particle could look up values via
      // service (to reduce throughput requirements)
      entries(this.stores).forEach(([name, store]) => inputs[name] = store.pojo);
    } else {
      const staticInputs = host.meta?.staticInputs;
      assign(inputs, staticInputs);
      if (inputBindings) {
        inputBindings.forEach(input => input && this.computeInput(entries(input)[0], inputs));
        this.log(`computeInputs(${host.id}) =`, inputs);
      }
    }
    return inputs;
  }
  protected computeInput([name, binding], inputs) {
    const storeName = binding || name;
    const store = this.stores[storeName];
    if (store) {
      inputs[name] = store.pojo;
    } else {
      // TODO(sjmiles): is this ok or not?
      //this.log.warn(`computeInput: "${storeName}" (bound to "${name}") not found`);
    }
  }
  // complement to `computeInputs`
  assignOutputs({id, meta}, outputs) {
    const names = keys(outputs);
    if (meta?.outputs && names.length) {
      names.forEach(name =>
        this.assignOutput(name, outputs[name], meta.outputs)
      );
      this.log(`[end][${id}] assignOutputs:`, outputs);
    }
  }
  protected assignOutput(name, output, outputs) {
    if (output !== undefined) {
      const binding = this.findOutputByName(outputs, name) || name;
      const store = this.stores[binding];
      if (!store) {
        if (outputs?.[name]) {
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
    const output = outputs?.find(output => keys(output || 0)[0] === name);
    if (output) {
      return values(output)[0];
    }
  }
  async render(packet) {
    if (this.composer) {
      this.composer.render({...packet, arcid: this.id});
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
