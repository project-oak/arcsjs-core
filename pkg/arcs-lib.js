var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key2, value) => {
  __defNormalProp(obj, typeof key2 !== "symbol" ? key2 + "" : key2, value);
  return value;
};

// pkg/js/core/EventEmitter.js
var EventEmitter = class {
  listeners = {};
  getEventListeners(eventName) {
    return this.listeners[eventName] || (this.listeners[eventName] = []);
  }
  fire(eventName, ...args) {
    const listeners = this.getEventListeners(eventName);
    if (listeners?.forEach) {
      listeners.forEach((listener) => listener(...args));
    }
  }
  listen(eventName, listener, listenerName) {
    const listeners = this.getEventListeners(eventName);
    listeners.push(listener);
    listener._name = listenerName || "(unnamed listener)";
    return listener;
  }
  unlisten(eventName, listener) {
    const list = this.getEventListeners(eventName);
    const index = typeof listener === "string" ? list.findIndex((l) => l._name === listener) : list.indexOf(listener);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      console.warn("failed to unlisten from", eventName);
    }
  }
};

// pkg/js/utils/types.js
var logKinds = ["log", "group", "groupCollapsed", "groupEnd", "dir"];
var errKinds = ["warn", "error"];

// pkg/js/utils/log.js
var { fromEntries } = Object;
var _logFactory = (enable, preamble, color, kind = "log") => {
  if (!enable) {
    return () => {
    };
  }
  if (kind === "dir") {
    return console.dir.bind(console);
  }
  const style = `background: ${color || "gray"}; color: white; padding: 1px 6px 2px 7px; border-radius: 6px 0 0 6px;`;
  return console[kind].bind(console, `%c${preamble}`, style);
};
var logFactory = (enable, preamble, color = "") => {
  const debugLoggers = fromEntries(logKinds.map((kind) => [kind, _logFactory(enable, preamble, color, kind)]));
  const errorLoggers = fromEntries(errKinds.map((kind) => [kind, _logFactory(true, preamble, color, kind)]));
  const loggers = { ...debugLoggers, ...errorLoggers };
  const log10 = loggers.log;
  Object.assign(log10, loggers);
  return log10;
};
logFactory.flags = globalThis.config?.logFlags || {};

// pkg/js/core/Arc.js
var customLogFactory = (id) => logFactory(logFactory.flags.arc, `Arc (${id})`, "slateblue");
var { assign, keys, entries, create } = Object;
var values = (o) => Object.values(o);
var nob = () => create(null);
var Arc = class extends EventEmitter {
  log;
  id;
  meta;
  stores;
  hosts;
  surface;
  composer;
  hostService;
  constructor(id, meta, surface) {
    super();
    this.id = id;
    this.meta = meta;
    this.surface = surface;
    this.hosts = nob();
    this.stores = nob();
    this.log = customLogFactory(id);
  }
  async addHost(host, surface) {
    await this.ensureComposer();
    this.hosts[host.id] = host;
    host.arc = this;
    this.updateHost(host);
    return host;
  }
  async ensureComposer() {
    if (!this.composer && this.surface) {
      this.composer = await this.surface.createComposer("root");
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
      store.listen("change", () => this.storeChanged(storeId, store), this.id);
    }
  }
  removeStore(storeId) {
    const store = this.stores[storeId];
    if (store) {
      store.unlisten("change", this.id);
    }
    delete this.stores[storeId];
  }
  storeChanged(storeId, store) {
    this.log(`storeChanged: "${storeId}"`);
    const isBound = (inputs) => inputs && inputs.some((input) => values(input)[0] == storeId || keys(input)[0] == storeId);
    values(this.hosts).forEach((host) => {
      const inputs = host.meta?.inputs;
      if (inputs === "*" || isBound(inputs)) {
        this.log(`host "${host.id}" has interest in "${storeId}"`);
        this.updateHost(host);
      }
    });
    this.fire("store-changed", storeId);
  }
  updateParticleMeta(hostId, meta) {
    const host = this.hosts[hostId];
    host.meta = meta;
    this.updateHost(host);
  }
  updateHost(host) {
    host.inputs = this.computeInputs(host);
  }
  computeInputs(host) {
    const inputs = nob();
    const inputBindings = host.meta?.inputs;
    if (inputBindings === "*") {
      entries(this.stores).forEach(([name, store]) => inputs[name] = store.pojo);
    } else {
      const staticInputs = host.meta?.staticInputs;
      assign(inputs, staticInputs);
      if (inputBindings) {
        inputBindings.forEach((input) => this.computeInput(entries(input)[0], inputs));
        this.log(`computeInputs(${host.id}) =`, inputs);
      }
    }
    return inputs;
  }
  computeInput([name, binding], inputs) {
    const storeName = binding || name;
    const store = this.stores[storeName];
    if (store) {
      inputs[name] = store.pojo;
    } else {
      this.log.warn(`computeInput: "${storeName}" (bound to "${name}") not found`);
    }
  }
  assignOutputs({ id, meta }, outputs) {
    const names = keys(outputs);
    if (meta?.outputs && names.length) {
      names.forEach((name) => this.assignOutput(name, outputs[name], meta.outputs));
      this.log(`[end][${id}] assignOutputs:`, outputs);
    }
  }
  assignOutput(name, output, outputs) {
    if (output !== void 0) {
      const binding = this.findOutputByName(outputs, name) || name;
      const store = this.stores[binding];
      if (!store) {
        if (outputs?.[name]) {
          this.log.warn(`assignOutputs: no "${binding}" store for output "${name}"`);
        }
      } else {
        this.log(`assignOutputs: "${name}" is dirty, updating Store "${binding}"`, output);
        store.data = output;
      }
    }
  }
  findOutputByName(outputs, name) {
    const output = outputs?.find((output2) => keys(output2)[0] === name);
    if (output) {
      return values(output)[0];
    }
  }
  async render(packet) {
    if (this.composer) {
      this.composer.render(packet);
    } else {
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
    if (result === void 0) {
      result = this.hostService?.(host, request);
    }
    return result;
  }
};

// pkg/js/utils/object.js
var shallowUpdate = (obj, data) => {
  let result = data;
  if (!data) {
  } else if (Array.isArray(data)) {
    if (!Array.isArray(obj)) {
      obj = [];
    }
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (obj[i] !== value) {
        obj[i] = value;
      }
    }
    const overage = obj.length - data.length;
    if (overage > 0) {
      obj.splice(data.length, overage);
    }
  } else if (typeof data === "object") {
    result = obj && typeof obj === "object" ? obj : /* @__PURE__ */ Object.create(null);
    const seen = {};
    Object.keys(data).forEach((key2) => {
      result[key2] = data[key2];
      seen[key2] = true;
    });
    Object.keys(result).forEach((key2) => {
      if (!seen[key2]) {
        delete result[key2];
      }
    });
  }
  return result;
};
var shallowMerge = (obj, data) => {
  if (data == null) {
    return null;
  }
  if (typeof data === "object") {
    const result = obj && typeof obj === "object" ? obj : /* @__PURE__ */ Object.create(null);
    Object.keys(data).forEach((key2) => result[key2] = data[key2]);
    return result;
  }
  return data;
};
function deepCopy(datum) {
  if (!datum) {
    return datum;
  } else if (Array.isArray(datum)) {
    return datum.map((element) => deepCopy(element));
  } else if (typeof datum === "object") {
    const clone = /* @__PURE__ */ Object.create(null);
    Object.entries(datum).forEach(([key2, value]) => {
      clone[key2] = deepCopy(value);
    });
    return clone;
  } else {
    return datum;
  }
}
var deepEqual = (a, b) => {
  const type = typeof a;
  if (type !== typeof b) {
    return false;
  }
  if (type === "object" && a && b) {
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);
    return aProps.length == bProps.length && !aProps.some((name) => !deepEqual(a[name], b[name]));
  }
  return a === b;
};
var deepUndefinedToNull = (obj) => {
  if (obj === void 0) {
    return null;
  }
  if (obj && typeof obj === "object") {
    const props = Object.getOwnPropertyNames(obj);
    props.forEach((name) => {
      const prop = obj[name];
      if (prop === void 0) {
        delete obj[name];
      } else {
        deepUndefinedToNull(prop);
      }
    });
  }
  return obj;
};

// pkg/js/utils/rand.js
var { floor, pow, random } = Math;
var key = (digits) => floor((1 + random() * 9) * pow(10, digits - 1));
var irand = (range) => floor(random() * range);
var arand = (array) => array[irand(array.length)];
var prob = (probability) => Boolean(random() < probability);

// pkg/js/core/Decorator.js
var log = logFactory(logFactory.flags.decorator, "Decorator", "plum");
var { values: values2, entries: entries2 } = Object;
var opaqueData = {};
var Decorator = {
  setOpaqueData(name, data) {
    opaqueData[name] = deepCopy(data);
    return name;
  },
  getOpaqueData(name) {
    return opaqueData[name];
  },
  maybeDecorateModel(model, particle) {
    if (model && !Array.isArray(model)) {
      values2(model).forEach((item) => {
        if (item && typeof item === "object") {
          if (item["models"]) {
            log("applying decorator(s) to list:", item);
            this.maybeDecorateItem(item, particle);
          } else {
            if (model?.filter || model?.decorator || model?.collateBy) {
              log("scanning for lists in sub-model:", item);
              this.maybeDecorateModel(item, particle);
            }
          }
        }
      });
    }
    return model;
  },
  maybeDecorateItem(item, particle) {
    let models = typeof item.models === "string" ? this.getOpaqueData(item.models) : item.models;
    models = maybeDecorate(models, item.decorator, particle);
    models = maybeFilter(models, item.filter, particle.impl);
    models = maybeCollateBy(models, item);
    item.models = models;
  }
};
var maybeDecorate = (models, decorator, particle) => {
  decorator = particle.impl[decorator] ?? decorator;
  const { inputs, state } = particle.internal;
  if (decorator) {
    const immutableInputs = Object.freeze(deepCopy(inputs));
    const immutableState = Object.freeze(deepCopy(state));
    models = models.map((model) => {
      model.privateData = model.privateData || {};
      const immutableModel = Object.freeze(deepCopy(model));
      const decorated = decorator(immutableModel, immutableInputs, immutableState);
      model.privateData = decorated.privateData;
      return { ...decorated, ...model };
    });
    models.sort(sortByLc("sortKey"));
    log("decoration was performed");
  }
  return models;
};
var maybeFilter = (models, filter, impl) => {
  filter = impl[filter] ?? filter;
  if (filter && models) {
    models = models.filter(filter);
  }
  return models;
};
var maybeCollateBy = (models, item) => {
  entries2(item).forEach(([name, collator]) => {
    if (collator?.["collateBy"]) {
      const collation = collate(models, collator["collateBy"]);
      models = collationToRenderModels(collation, name, collator["$template"]);
    }
  });
  return models;
};
var sortByLc = (key2) => (a, b) => sort(String(a[key2]).toLowerCase(), String(b[key2]).toLowerCase());
var sort = (a, b) => a < b ? -1 : a > b ? 1 : 0;
var collate = (models, collateBy) => {
  const collation = {};
  models.forEach((model) => {
    const keyValue = model[collateBy];
    if (keyValue) {
      const category = collation[keyValue] || (collation[keyValue] = []);
      category.push(model);
    }
  });
  return collation;
};
var collationToRenderModels = (collation, name, $template) => {
  return entries2(collation).map(([key2, models]) => ({
    key: key2,
    [name]: { models, $template },
    single: !(models["length"] !== 1),
    ...models?.[0]
  }));
};

// pkg/js/core/Host.js
var { entries: entries3, keys: keys2 } = Object;
var customLogFactory2 = (id) => logFactory(logFactory.flags.host, `Host (${id})`, arand(["#5a189a", "#51168b", "#48137b", "#6b2fa4", "#7b46ae", "#3f116c"]));
var Host = class extends EventEmitter {
  arc;
  id;
  lastOutput;
  log;
  meta;
  particle;
  constructor(id) {
    super();
    this.log = customLogFactory2(id);
    this.id = id;
  }
  onevent(eventlet) {
    this.arc?.onevent(eventlet);
  }
  installParticle(particle, meta) {
    if (this.particle) {
      this.detachParticle();
    }
    if (particle) {
      this.particle = particle;
      this.meta = meta || this.meta;
    }
  }
  get container() {
    return this.meta?.container || "root";
  }
  detach() {
    this.detachParticle();
    this.arc = null;
  }
  detachParticle() {
    const { particle } = this;
    if (particle) {
      this.render({ $clear: true });
      this.particle = null;
      this.meta = null;
    }
  }
  async service(request) {
    if (request?.decorate) {
      return Decorator.maybeDecorateModel(request.model, this.particle);
    }
    return this.arc?.service(this, request);
  }
  output(outputModel, renderModel) {
    if (outputModel) {
      this.lastOutput = outputModel;
      this.arc?.assignOutputs(this, outputModel);
    }
    if (this.template) {
      Decorator.maybeDecorateModel(renderModel, this.particle);
      this.log(renderModel);
      this.render(renderModel);
    }
  }
  render(model) {
    const { id, container, template } = this;
    this.arc?.render({ id, container, content: { template, model } });
  }
  set inputs(inputs) {
    if (this.particle && inputs) {
      const lastInputs = this.particle.internal.inputs;
      if (this.dirtyCheck(inputs, lastInputs, this.lastOutput)) {
        this.particle.inputs = { ...this.meta?.staticInputs, ...inputs };
        this.fire("inputs-changed");
      } else {
        this.log("inputs are uninteresting, skipping update");
      }
    }
  }
  dirtyCheck(inputs, lastInputs, lastOutput) {
    const dirtyBits = ([n, v]) => lastOutput?.[n] && !deepEqual(lastOutput[n], v) || !deepEqual(lastInputs?.[n], v);
    return !lastInputs || entries3(inputs).length !== this.lastInputsLength(lastInputs) || entries3(inputs).some(dirtyBits);
  }
  lastInputsLength(lastInputs) {
    return keys2(lastInputs).filter((key2) => !this.meta?.staticInputs?.[key2] && key2 !== "eventlet").length;
  }
  get config() {
    return this.particle?.config;
  }
  get template() {
    return this.config?.template;
  }
  invalidate() {
    this.particle?.invalidate();
  }
  handleEvent(eventlet) {
    return this.particle?.handleEvent(eventlet);
  }
};

// pkg/js/core/Store.js
var { create: create2, keys: keys3 } = Object;
var { stringify, parse } = JSON;
var DataStore = class extends EventEmitter {
  privateData;
  constructor() {
    super();
  }
  setPrivateData(data) {
    this.privateData = data;
  }
  set data(data) {
    this.setPrivateData(data);
  }
  get data() {
    return this.privateData;
  }
  toString() {
    return this.pretty;
  }
  get isObject() {
    return this.data && typeof this.data === "object";
  }
  get pojo() {
    return this.data;
  }
  get json() {
    return stringify(this.data);
  }
  set json(json) {
    let value = null;
    try {
      value = parse(json);
    } catch (x) {
    }
    this.data = value;
  }
  get pretty() {
    const sorted = {};
    const pojo = this.pojo;
    keys3(pojo).sort().forEach((key2) => sorted[key2] = pojo[key2]);
    return stringify(sorted, null, "  ");
  }
};
var ObservableStore = class extends DataStore {
  change(mutator) {
    mutator(this);
    this.doChange();
  }
  doChange() {
    this.fire("change", this);
    this.onChange(this);
  }
  onChange(store) {
  }
  set data(data) {
    this.change((self) => self.setPrivateData(data));
  }
  get data() {
    return this["privateData"];
  }
  set(key2, value) {
    if (!this.data) {
      this.setPrivateData(create2(null));
    }
    if (value !== void 0) {
      this.change((self) => self.data[key2] = value);
    } else {
      this.delete(key2);
    }
  }
  delete(key2) {
    this.change((doc) => delete doc.data[key2]);
  }
};
var PersistableStore = class extends ObservableStore {
  meta;
  persistor;
  willPersist;
  constructor(meta) {
    super();
    this.meta = { ...meta };
  }
  toString() {
    return `${JSON.stringify(this.meta, null, "  ")}, ${this.pretty}`;
  }
  get tags() {
    return this.meta.tags ?? (this.meta.tags = []);
  }
  is(...tags) {
    return tags.every((tag) => this.tags.includes(tag));
  }
  isCollection() {
    return this.meta.type?.[0] === "[";
  }
  async doChange() {
    this.persist();
    return super.doChange();
  }
  async persist() {
    if (!this.willPersist && this.persistor) {
      this.willPersist = true;
      setTimeout(() => {
        this.willPersist = false;
        this.persistor.persist(this);
      }, 500);
    }
  }
  async restore(value) {
    const restored = await this.persistor?.restore(this);
    if (!restored && value !== void 0) {
      this.data = value;
    }
  }
  delete() {
    this.persistor?.remove(this);
  }
  save() {
    return this.json;
  }
  load(serial, defaultValue) {
    let value = defaultValue;
    try {
      if (serial) {
        value = parse(serial);
      }
    } catch (x) {
    }
    if (value !== void 0) {
      this.data = value;
    }
  }
};
var Store = class extends PersistableStore {
};

// pkg/js/utils/id.js
var makeId = (pairs, digits, delim) => {
  pairs = pairs || 2;
  digits = digits || 2;
  delim = delim || "-";
  const min = Math.pow(10, digits - 1);
  const range = Math.pow(10, digits) - min;
  const result = [];
  for (let i = 0; i < pairs; i++) {
    result.push(`${irand(range - min) + min}`);
  }
  return result.join(delim);
};

// pkg/js/Runtime.js
var log2 = logFactory(logFactory.flags.runtime, "runtime", "forestgreen");
var particleFactoryCache = {};
var storeFactories = {};
var { keys: keys4 } = Object;
var _Runtime = class extends EventEmitter {
  log;
  uid;
  nid;
  arcs;
  stores;
  peers;
  shares;
  endpoint;
  network;
  surfaces;
  persistor;
  prettyUid;
  constructor(uid) {
    uid = uid || "user";
    super();
    this.arcs = {};
    this.surfaces = {};
    this.stores = {};
    this.peers = /* @__PURE__ */ new Set();
    this.shares = /* @__PURE__ */ new Set();
    this.setUid(uid);
    this.log = logFactory(logFactory.flags.runtime, `runtime:[${this.prettyUid}]`, "forestgreen");
    _Runtime.securityLockdown?.(_Runtime.particleOptions);
  }
  setUid(uid) {
    this.uid = uid;
    this.nid = `${uid}:${makeId(1, 2)}`;
    this.prettyUid = uid.substring(0, uid.indexOf("@") + 1);
  }
  async bootstrapArc(name, meta, surface, service) {
    const arc = new Arc(name, meta, surface);
    arc.hostService = this.serviceFactory(service);
    await this.addArc(arc);
    return arc;
  }
  serviceFactory(service) {
    return async (host, request) => service.handle(this, host, request);
  }
  async bootstrapParticle(arc, id, meta) {
    const host = new Host(id);
    await this.marshalParticle(host, meta);
    const promise = arc.addHost(host);
    log2("bootstrapped particle", id);
    return promise;
  }
  addSurface(id, surface) {
    this.surfaces[id] = surface;
  }
  getSurface(id) {
    return this.surfaces[id];
  }
  addArc(arc) {
    const { id } = arc;
    if (id && !this.arcs[id]) {
      return this.arcs[id] = arc;
    }
    throw `arc has no id, or id "${id}" is already in use`;
  }
  removeArc(arc) {
    const { id } = arc;
    if (!id || !this.arcs[id]) {
      throw !id ? `arc has no id` : `id "${id}" is not in use`;
    }
    delete this.arcs[id];
  }
  async marshalParticle(host, particleMeta) {
    const particle = await this.createParticle(host, particleMeta.kind);
    host.installParticle(particle, particleMeta);
  }
  async installParticle(arc, particleMeta, name) {
    name = name || makeId();
    if (arc.hosts[name]) {
      let n = 1;
      for (; arc.hosts[`${name}-${n}`]; n++)
        ;
      name = `${name}-${n}`;
    }
    const host = new Host(name);
    await this.marshalParticle(host, particleMeta);
    arc.addHost(host);
    return host;
  }
  addStore(storeId, store) {
    if (store.marshal) {
      store.marshal(this);
    }
    if (store.persistor) {
      store.persistor.persist = (store2) => this.persistor?.persist(storeId, store2);
    }
    const name = `${this.nid}:${storeId}-changed`;
    const onChange = this.storeChanged.bind(this, storeId);
    store.listen("change", onChange, name);
    this.stores[storeId] = store;
    this.maybeShareStore(storeId);
  }
  storeChanged(storeId, store) {
    this.log("storeChanged", storeId);
    this.network?.invalidatePeers(storeId);
    this.onStoreChange(storeId, store);
    this.fire("store-changed", { storeId, store });
  }
  onStoreChange(storeId, store) {
  }
  do(storeId, task) {
    task(this.stores[storeId]);
  }
  removeStore(storeId) {
    this.do(storeId, (store) => {
      store?.unlisten("change", `${this.nid}:${storeId}-changed`);
    });
    delete this.stores[storeId];
  }
  maybeShareStore(storeId) {
    this.do(storeId, (store) => {
      if (store?.is("shared")) {
        this.shareStore(storeId);
      }
    });
  }
  addPeer(peerId) {
    this.peers.add(peerId);
    [...this.shares].forEach((storeId) => this.maybeShareStoreWithPeer(storeId, peerId));
  }
  shareStore(storeId) {
    this.shares.add(storeId);
    [...this.peers].forEach((peerId) => this.maybeShareStoreWithPeer(storeId, peerId));
  }
  maybeShareStoreWithPeer(storeId, peerId) {
    this.do(storeId, (store) => {
      const nid = this.uid.replace(/\./g, "_");
      if (!store.is("private") || peerId.startsWith(nid)) {
        this.shareStoreWithPeer(storeId, peerId);
      }
    });
  }
  shareStoreWithPeer(storeId, peerId) {
    this.network?.shareStore(storeId, peerId);
  }
  async createParticle(host, kind) {
    try {
      const factory = await this.marshalParticleFactory(kind);
      return factory(host);
    } catch (x) {
      log2.error(`createParticle(${kind}):`, x);
    }
  }
  async marshalParticleFactory(kind) {
    return particleFactoryCache[kind] ?? this.lateBindParticle(kind);
  }
  lateBindParticle(kind) {
    return _Runtime.registerParticleFactory(kind, _Runtime?.particleIndustry(kind, _Runtime.particleOptions));
  }
  static registerParticleFactory(kind, factoryPromise) {
    return particleFactoryCache[kind] = factoryPromise;
  }
  requireStore(meta) {
    let store = this.stores[meta.name];
    if (!store) {
      store = this.createStore(meta);
      this.addStore(meta.name, store);
    }
    return store;
  }
  createStore(meta) {
    const key2 = keys4(storeFactories).find((tag) => meta.tags?.includes?.(tag));
    const storeClass = storeFactories[String(key2)] || Store;
    return new storeClass(meta);
  }
  static registerStoreClass(tag, storeClass) {
    storeFactories[tag] = storeClass;
  }
};
var Runtime = _Runtime;
__publicField(Runtime, "securityLockdown");
__publicField(Runtime, "particleIndustry");
__publicField(Runtime, "particleOptions");

// pkg/js/recipe/RecipeParser.js
var log3 = logFactory(logFactory.flags.recipe, "flan", "violet");
var { entries: entries4, create: create3 } = Object;
var Parser = class {
  stores;
  particles;
  slots;
  meta;
  constructor(recipe) {
    this.stores = [];
    this.particles = [];
    this.slots = [];
    this.meta = create3(null);
    if (recipe) {
      this.parse(recipe);
    }
  }
  parse(recipe) {
    const normalized = this.normalize(recipe);
    this.parseSlotSpec(normalized, "root", "");
    return this;
  }
  normalize(recipe) {
    if (typeof recipe !== "object") {
      throw Error("recipe must be an Object");
    }
    return recipe;
  }
  parseSlotSpec(spec, slotName, parentName) {
    for (const key2 in spec) {
      switch (key2) {
        case "$meta":
          this.meta = { ...this.meta, ...spec.$meta };
          break;
        case "$stores":
          this.parseStoresNode(spec.$stores);
          break;
        default: {
          const container = parentName ? `${parentName}#${slotName}` : slotName;
          this.parseParticleSpec(container, key2, spec[key2]);
          break;
        }
      }
    }
  }
  parseStoresNode(stores) {
    for (const key2 in stores) {
      this.parseStoreSpec(key2, stores[key2]);
    }
  }
  parseStoreSpec(name, spec) {
    if (this.stores.find((s) => s.name === name)) {
      log3("duplicate store name");
      return;
    }
    const meta = {
      name,
      type: spec.$type,
      tags: spec.$tags,
      value: spec.$value
    };
    this.stores.push(meta);
  }
  parseParticleSpec(container, id, spec) {
    if (!spec.$kind) {
      log3.warn(`parseParticleSpec: malformed spec has no "kind":`, spec);
      throw Error();
    }
    if (this.particles.find((s) => s.id === id)) {
      log3("duplicate particle name");
      return;
    }
    this.particles.push({ id, container, spec });
    if (spec.$slots) {
      this.parseSlotsNode(spec.$slots, id);
    }
  }
  parseSlotsNode(slots, parent) {
    entries4(slots).forEach(([key2, spec]) => this.parseSlotSpec(spec, key2, parent));
  }
};

// pkg/js/utils/matching.js
function matches(candidateMeta, targetMeta) {
  for (const property in targetMeta) {
    if (candidateMeta[property] !== targetMeta[property]) {
      return false;
    }
  }
  return true;
}

// pkg/js/recipe/StoreCook.js
var log4 = logFactory(logFactory.flags.recipe, "StoreCook", "#187e13");
var { values: values3 } = Object;
var findStores = (runtime, criteria) => {
  return values3(runtime.stores).filter((store) => matches(store?.meta, criteria));
};
var mapStore = (runtime, { name, type }) => {
  return findStores(runtime, { name, type })?.[0];
};
var StoreCook = class {
  static async execute(runtime, arc, stores) {
    return this.forEachStore(this.realizeStore, runtime, arc, stores);
  }
  static async evacipate(runtime, arc, stores) {
    return this.forEachStore(this.derealizeStore, runtime, arc, stores);
  }
  static async forEachStore(task, runtime, arc, stores) {
    return Promise.all(stores.map((store) => task.call(this, runtime, arc, store)));
  }
  static async realizeStore(runtime, arc, rawMeta) {
    const meta = this.constructMeta(runtime, arc, rawMeta);
    let store = mapStore(runtime, meta);
    if (!store) {
    } else {
      log4(`realizeStore: mapped "${rawMeta.name}" to "${store.meta.name}"`);
    }
    if (!store) {
      store = runtime.createStore(meta);
      store && (store.persistor = {
        restore: (store2) => runtime.persistor?.restore(meta.name, store2),
        persist: () => {
        }
      });
      runtime.addStore(meta.name, store);
      await store?.restore(meta?.value);
      log4(`realizeStore: created "${meta.name}"`);
    } else {
      log4(`realizeStore: mapped to "${meta.name}", setting data to:`, meta?.value);
      if (meta?.value !== void 0) {
        store.data = meta?.value;
      }
    }
    arc.addStore(meta.name, store);
  }
  static async derealizeStore(runtime, arc, spec) {
    runtime.removeStore(spec.$name);
    arc.removeStore(spec.$name);
  }
  static constructMeta(runtime, arc, rawMeta) {
    const meta = {
      ...rawMeta,
      arcid: arc.id,
      uid: runtime.uid
    };
    return {
      ...meta,
      owner: meta.uid,
      shareid: `${meta.name}:${meta.arcid}:${meta.uid}`
    };
  }
};

// pkg/js/recipe/ParticleCook.js
var log5 = logFactory(logFactory.flags.recipe, "ParticleCook", "#096f33");
var ParticleCook = class {
  static async execute(runtime, arc, particles) {
    for (const particle of particles) {
      await this.realizeParticle(runtime, arc, particle);
    }
  }
  static async realizeParticle(runtime, arc, node) {
    log5("realizedParticle:", node.id);
    const meta = this.specToMeta(node.spec);
    meta.container ||= node.container;
    return runtime.bootstrapParticle(arc, node.id, meta);
  }
  static specToMeta(spec) {
    const { $kind: kind, $container: container, $staticInputs: staticInputs } = spec;
    const inputs = this.formatBindings(spec.$inputs);
    const outputs = this.formatBindings(spec.$outputs);
    return { kind, staticInputs, inputs, outputs, container };
  }
  static formatBindings(bindings) {
    return bindings?.map?.((binding) => typeof binding === "string" ? { [binding]: binding } : binding);
  }
  static async evacipate(runtime, arc, particles) {
    return Promise.all(particles.map((particle) => this.derealizeParticle(runtime, arc, particle)));
  }
  static async derealizeParticle(runtime, arc, node) {
    arc.removeHost(node.id);
  }
};

// pkg/js/recipe/Chef.js
var log6 = logFactory(logFactory.flags.recipe, "Chef", "#087f23");
var Chef = class {
  static async execute(recipe, runtime, arc) {
    if (arc instanceof Promise) {
      log6.error("`arc` must be an Arc, not a Promise. Make sure `boostrapArc` is awaited.");
      return;
    }
    log6("|-->...| executing recipe: ", recipe.$meta ?? "");
    const plan = new Parser(recipe);
    await StoreCook.execute(runtime, arc, plan.stores);
    await ParticleCook.execute(runtime, arc, plan.particles);
    arc.meta = { ...arc.meta, ...plan.meta };
    log6("|...-->| recipe complete: ", recipe.$meta ?? "");
  }
  static async evacipate(recipe, runtime, arc) {
    log6("|-->...| evacipating recipe: ", recipe.$meta);
    const plan = new Parser(recipe);
    await ParticleCook.evacipate(runtime, arc, plan.particles);
    log6("|...-->| recipe evacipated: ", recipe.$meta);
  }
  static async executeAll(recipes, runtime, arc) {
    for (const recipe of recipes) {
      await this.execute(recipe, runtime, arc);
    }
  }
  static async evacipateAll(recipes, runtime, arc) {
    return Promise.all(recipes?.map((recipe) => this.evacipate(recipe, runtime, arc)));
  }
};

// pkg/js/render/Composer.js
var log7 = logFactory(logFactory.flags.composer, "composer", "red");
var Composer = class extends EventEmitter {
  slots;
  pendingPackets;
  constructor() {
    super();
    this.slots = {};
    this.pendingPackets = [];
  }
  activate() {
    this.fire("activate");
  }
  processPendingPackets() {
    const packets = this.pendingPackets;
    if (packets.length) {
      this.pendingPackets = [];
      packets.forEach((packet) => {
        packet.pendCount = (packet.pendCount || 0) + 1;
        this.render(packet);
      });
    }
  }
  render(packet) {
    const { id, container, content: { template, model } } = packet;
    log7({ id, container, model });
    let slot = this.slots[id];
    if (model?.$clear) {
      if (slot) {
        this.processPendingPackets();
        this.slots[id] = null;
        this.clearSlot(slot);
      }
      return;
    }
    if (!slot) {
      const parent = this.findContainer(container);
      if (!parent) {
        this.pendingPackets.push(packet);
        if (++packet["pendCount"] % 1e4 === 0) {
          log7.warn(`container [${container}] unavailable for slot [${id}] (x1e4)`);
        }
        return;
      }
      slot = this.generateSlot(id, template, parent);
      this.slots[id] = slot;
    }
    if (slot && model) {
      this.maybeReattachSlot(slot, container);
      slot.set(model);
      this.processPendingPackets();
    }
  }
  clearSlot(slot) {
  }
  findContainer(container) {
    return null;
  }
  generateSlot(id, template, parent) {
    return null;
  }
  maybeReattachSlot(slot, container) {
  }
  onevent(pid, eventlet) {
    log7(`[${pid}] sent [${eventlet.handler}] event`);
  }
  requestFontFamily(fontFamily) {
    return false;
  }
};

// pkg/js/render/Surface.js
var log8 = logFactory(logFactory.flags.composer, "surface", "tomato");
var Surface = class {
  async createComposer(id) {
    const composer = await this.createComposerInstance(id);
    return composer;
  }
  async createComposerInstance(id) {
    return new Composer();
  }
  async service(msg) {
  }
};

// pkg/js/utils/paths.js
var PathMapper = class {
  map;
  constructor(root3) {
    this.map = {};
    this.setRoot(root3);
  }
  add(mappings) {
    Object.assign(this.map, mappings || {});
  }
  resolve(path) {
    const bits = path.split("/");
    const top = bits.shift();
    const prefix = this.map[top] || top;
    return [prefix, ...bits].join("/");
  }
  setRoot(root3) {
    if (root3.length && root3[root3.length - 1] === "/") {
      root3 = root3.slice(0, -1);
    }
    this.add({
      "$root": root3,
      "$arcs": root3
    });
  }
  getAbsoluteHereUrl(meta, depth) {
    const localRelative = meta.url.split("/").slice(0, -(depth ?? 1)).join("/");
    let base = document.URL;
    if (base[base.length - 1] !== "/") {
      base = base.split("/").slice(0, -1).join("/");
    }
    let localAbsolute = new URL(localRelative, base).href;
    if (localAbsolute[localAbsolute.length - 1] === "/") {
      localAbsolute = localAbsolute.slice(0, -1);
    }
    return localAbsolute;
  }
};
var root = import.meta.url.split("/").slice(0, -3).join("/");
var Paths = globalThis["Paths"] = new PathMapper(root);
Paths.add(globalThis.config?.paths);

// pkg/js/isolation/code.js
var log9 = logFactory(logFactory.flags.code, "code", "gold");
var defaultParticleBasePath = "$arcs/js/core/Particle.js";
var requireParticleBaseCode = async (sourcePath) => {
  if (!requireParticleBaseCode.source) {
    const path = Paths.resolve(sourcePath || defaultParticleBasePath);
    log9("particle base code path: ", path);
    const response = await fetch(path);
    const moduleText = await response.text() + "\n//# sourceURL=" + path + "\n";
    requireParticleBaseCode.source = moduleText.replace(/export /g, "");
  }
  return requireParticleBaseCode.source;
};
requireParticleBaseCode.source = null;
var requireParticleImplCode = async (kind, options) => {
  const code = options?.code || await fetchParticleCode(kind);
  return code.slice(code.indexOf("({"));
};
var fetchParticleCode = async (kind) => {
  if (kind) {
    return await maybeFetchParticleCode(kind);
  }
  log9.error(`fetchParticleCode: empty 'kind'`);
};
var maybeFetchParticleCode = async (kind) => {
  const path = pathForKind(kind);
  try {
    const response = await fetch(path);
    return await response.text();
  } catch (x) {
    log9.error(`could not locate implementation for particle "${kind}" [${path}]`);
  }
};
var pathForKind = (kind) => {
  if (kind) {
    if (!"$./".includes(kind[0]) && !kind.includes("://")) {
      kind = `$library/${kind}`;
    }
    if (!kind?.split("/").pop().includes(".")) {
      kind = `${kind}.js`;
    }
    return Paths.resolve(kind);
  }
  return "404";
};

// pkg/js/utils/utils.js
var utils_exports = {};
__export(utils_exports, {
  PathMapper: () => PathMapper,
  Paths: () => Paths,
  arand: () => arand,
  async: () => async,
  asyncTask: () => asyncTask,
  computeAgeString: () => computeAgeString,
  debounce: () => debounce,
  deepCopy: () => deepCopy,
  deepEqual: () => deepEqual,
  deepUndefinedToNull: () => deepUndefinedToNull,
  irand: () => irand,
  kebabToCaps: () => kebabToCaps,
  key: () => key,
  logFactory: () => logFactory,
  makeCapName: () => makeCapName,
  makeId: () => makeId,
  makeName: () => makeName,
  matches: () => matches,
  prob: () => prob,
  shallowMerge: () => shallowMerge,
  shallowUpdate: () => shallowUpdate
});

// pkg/js/utils/date.js
var computeAgeString = (date, now) => {
  let deltaTime = Math.round((now - date) / 1e3);
  if (isNaN(deltaTime)) {
    return `\u2022`;
  }
  let plural = "";
  if (deltaTime < 60) {
    if (deltaTime > 1)
      plural = "s";
    return `${deltaTime} second${plural} ago`;
  }
  deltaTime = Math.round(deltaTime / 60);
  if (deltaTime < 60) {
    if (deltaTime > 1)
      plural = "s";
    return `${deltaTime} minute${plural} ago`;
  }
  deltaTime = Math.round(deltaTime / 60);
  if (deltaTime < 24) {
    if (deltaTime > 1)
      plural = "s";
    return `${deltaTime} hour${plural} ago`;
  }
  deltaTime = Math.round(deltaTime / 24);
  if (deltaTime < 30) {
    if (deltaTime > 1)
      plural = "s";
    return `${deltaTime} day${plural} ago`;
  }
  deltaTime = Math.round(deltaTime / 30);
  if (deltaTime < 12) {
    if (deltaTime > 1)
      plural = "s";
    return `${deltaTime} month${plural} ago`;
  }
  deltaTime = Math.round(deltaTime / 12);
  if (deltaTime > 1)
    plural = "s";
  return `${deltaTime} year${plural} ago`;
};

// pkg/js/utils/names.js
var makeName = (delim) => {
  return `${arand(name1)}${delim || "-"}${arand(name2)}`;
};
var makeCapName = () => {
  return kebabToCaps(makeName());
};
var kebabToCaps = (s) => {
  const neo = [];
  for (let i = 0, c; c = s[i]; i++) {
    neo.push(i > 0 && c !== "-" ? c : s[i > 0 ? ++i : i].toUpperCase());
  }
  return neo.join("");
};
var name1 = ["abandoned", "able", "absolute", "adorable", "adventurous", "academic", "acceptable", "acclaimed", "accomplished", "accurate", "aching", "acidic", "acrobatic", "active", "actual", "adept", "admirable", "admired", "adolescent", "adorable", "adored", "advanced", "afraid", "affectionate", "aged", "aggravating", "aggressive", "agile", "agitated", "agonizing", "agreeable", "ajar", "alarmed", "alarming", "alert", "alienated", "alive", "all", "altruistic", "amazing", "ambitious", "ample", "amused", "amusing", "anchored", "ancient", "angelic", "angry", "anguished", "animated", "annual", "another", "antique", "anxious", "any", "apprehensive", "appropriate", "apt", "arctic", "arid", "aromatic", "artistic", "ashamed", "assured", "astonishing", "athletic", "attached", "attentive", "attractive", "austere", "authentic", "authorized", "automatic", "avaricious", "average", "aware", "awesome", "awful", "awkward", "babyish", "bad", "back", "baggy", "bare", "barren", "basic", "beautiful", "belated", "beloved", "beneficial", "better", "best", "bewitched", "big", "big-hearted", "biodegradable", "bite-sized", "bitter", "black", "black-and-white", "bland", "blank", "blaring", "bleak", "blind", "blissful", "blond", "blue", "blushing", "bogus", "boiling", "bold", "bony", "boring", "bossy", "both", "bouncy", "bountiful", "bowed", "brave", "breakable", "brief", "bright", "brilliant", "brisk", "broken", "bronze", "brown", "bruised", "bubbly", "bulky", "bumpy", "buoyant", "burdensome", "burly", "bustling", "busy", "buttery", "buzzing", "calculating", "calm", "candid", "canine", "capital", "carefree", "careful", "careless", "caring", "cautious", "cavernous", "celebrated", "charming", "cheap", "cheerful", "cheery", "chief", "chilly", "chubby", "circular", "classic", "clean", "clear", "clear-cut", "clever", "close", "closed", "cloudy", "clueless", "clumsy", "cluttered", "coarse", "cold", "colorful", "colorless", "colossal", "comfortable", "common", "compassionate", "competent", "complete", "complex", "complicated", "composed", "concerned", "concrete", "confused", "conscious", "considerate", "constant", "content", "conventional", "cooked", "cool", "cooperative", "coordinated", "corny", "corrupt", "costly", "courageous", "courteous", "crafty", "crazy", "creamy", "creative", "creepy", "criminal", "crisp", "critical", "crooked", "crowded", "cruel", "crushing", "cuddly", "cultivated", "cultured", "cumbersome", "curly", "curvy", "cute", "cylindrical", "damaged", "damp", "dangerous", "dapper", "daring", "darling", "dark", "dazzling", "dead", "deadly", "deafening", "dear", "dearest", "decent", "decimal", "decisive", "deep", "defenseless", "defensive", "defiant", "deficient", "definite", "definitive", "delayed", "delectable", "delicious", "delightful", "delirious", "demanding", "dense", "dental", "dependable", "dependent", "descriptive", "deserted", "detailed", "determined", "devoted", "different", "difficult", "digital", "diligent", "dim", "dimpled", "dimwitted", "direct", "discrete", "distant", "downright", "dreary", "dirty", "disguised", "dishonest", "dismal", "distant", "distinct", "distorted", "dizzy", "dopey", "doting", "double", "downright", "drab", "drafty", "dramatic", "droopy", "dry", "dual", "dutiful", "each", "eager", "earnest", "early", "easy", "easy-going", "ecstatic", "edible", "educated", "elaborate", "elastic", "elated", "elderly", "electric", "elegant", "elementary", "elliptical", "embarrassed", "embellished", "eminent", "emotional", "empty", "enchanted", "enchanting", "energetic", "enlightened", "enormous", "enraged", "entire", "envious", "equal", "equatorial", "essential", "esteemed", "ethical", "euphoric", "even", "evergreen", "everlasting", "every", "evil", "exalted", "excellent", "exemplary", "exhausted", "excitable", "excited", "exciting", "exotic", "expensive", "experienced", "expert", "extraneous", "extroverted", "extra-large", "extra-small", "fabulous", "failing", "faint", "fair", "faithful", "fake", "false", "familiar", "famous", "fancy", "fantastic", "far", "faraway", "far-flung", "far-off", "fast", "fat", "fatal", "fatherly", "favorable", "favorite", "fearful", "fearless", "feisty", "feline", "female", "feminine", "few", "fickle", "filthy", "fine", "finished", "firm", "first", "firsthand", "fitting", "fixed", "flaky", "flamboyant", "flashy", "flat", "flawed", "flawless", "flickering", "flimsy", "flippant", "flowery", "fluffy", "fluid", "flustered", "focused", "fond", "foolhardy", "foolish", "forceful", "forked", "formal", "forsaken", "forthright", "fortunate", "fragrant", "frail", "frank", "frayed", "free", "French", "fresh", "frequent", "friendly", "frightened", "frightening", "frigid", "frilly", "frizzy", "frivolous", "front", "frosty", "frozen", "frugal", "fruitful", "full", "fumbling", "functional", "funny", "fussy", "fuzzy", "gargantuan", "gaseous", "general", "generous", "gentle", "genuine", "giant", "giddy", "gigantic", "gifted", "giving", "glamorous", "glaring", "glass", "gleaming", "gleeful", "glistening", "glittering", "gloomy", "glorious", "glossy", "glum", "golden", "good", "good-natured", "gorgeous", "graceful", "gracious", "grand", "grandiose", "granular", "grateful", "gray", "great", "green", "gregarious", "gripping", "grizzled", "grouchy", "grounded", "growing", "growling", "grown", "grubby", "gruesome", "grumpy", "guilty", "gullible", "gummy", "hairy", "half", "handmade", "handsome", "handy", "happy", "happy-go-lucky", "hard", "hard-to-find", "harmful", "harmless", "harmonious", "harsh", "hasty", "hateful", "haunting", "healthy", "heartfelt", "hearty", "heavenly", "heavy", "hefty", "helpful", "helpless", "hidden", "hideous", "high", "high-level", "hilarious", "hoarse", "hollow", "homely", "honest", "honorable", "honored", "hopeful", "horrible", "hospitable", "hot", "huge", "humble", "humiliating", "humming", "humongous", "hungry", "hurtful", "husky", "icky", "icy", "ideal", "idealistic", "identical", "idle", "idiotic", "idolized", "ignorant", "ill", "illegal", "ill-fated", "ill-informed", "illiterate", "illustrious", "imaginary", "imaginative", "immaculate", "immaterial", "immediate", "immense", "impassioned", "impeccable", "impartial", "imperfect", "imperturbable", "impish", "impolite", "important", "impossible", "impractical", "impressionable", "impressive", "improbable", "impure", "inborn", "incomparable", "incompatible", "incomplete", "inconsequential", "incredible", "indelible", "inexperienced", "indolent", "infamous", "infantile", "infatuated", "inferior", "infinite", "informal", "innocent", "insistent", "instructive", "insubstantial", "intelligent", "intent", "intentional", "interesting", "internal", "international", "intrepid", "ironclad", "itchy", "jaded", "jagged", "jam-packed", "jaunty", "jealous", "jittery", "joint", "jolly", "jovial", "joyful", "joyous", "jubilant", "judicious", "juicy", "jumbo", "junior", "jumpy", "juvenile", "kaleidoscopic", "keen", "key", "kind", "kindhearted", "kindly", "klutzy", "knobby", "knotty", "knowledgeable", "knowing", "known", "kooky", "kosher", "lanky", "large", "last", "lasting", "late", "lavish", "lawful", "lazy", "leading", "lean", "leafy", "left", "legal", "legitimate", "light", "lighthearted", "likable", "likely", "limited", "limp", "limping", "linear", "lined", "liquid", "little", "live", "lively", "livid", "lone", "lonely", "long", "long-term", "loose", "lopsided", "lost", "loud", "lovable", "lovely", "loving", "low", "loyal", "lucky", "lumbering", "luminous", "lumpy", "lustrous", "luxurious", "mad", "made-up", "magnificent", "majestic", "major", "male", "mammoth", "married", "marvelous", "masculine", "massive", "mature", "meager", "mealy", "mean", "measly", "meaty", "medical", "mediocre", "medium", "meek", "mellow", "melodic", "memorable", "menacing", "merry", "messy", "metallic", "mild", "milky", "mindless", "miniature", "minor", "minty", "miserable", "miserly", "misguided", "misty", "mixed", "modern", "modest", "moist", "monstrous", "monthly", "monumental", "moral", "mortified", "motherly", "motionless", "mountainous", "muddy", "muffled", "multicolored", "mundane", "murky", "mushy", "muted", "mysterious", "naive", "narrow", "nasty", "natural", "naughty", "nautical", "near", "neat", "necessary", "negligible", "neighboring", "nervous", "new", "next", "nice", "nifty", "nimble", "nippy", "nocturnal", "noisy", "nonstop", "normal", "notable", "noted", "noteworthy", "novel", "numb", "nutritious", "nutty", "obedient", "oblong", "oily", "oblong", "obvious", "occasional", "odd", "oddball", "offbeat", "offensive", "official", "old", "old-fashioned", "only", "open", "optimal", "optimistic", "opulent", "orange", "orderly", "organic", "ornate", "ornery", "ordinary", "original", "other", "our", "outlying", "outgoing", "outlandish", "outrageous", "outstanding", "oval", "overcooked", "overdue", "overjoyed", "overlooked", "palatable", "pale", "paltry", "parallel", "parched", "partial", "passionate", "past", "pastel", "peaceful", "peppery", "perfect", "perfumed", "periodic", "perky", "personal", "pertinent", "pesky", "pessimistic", "petty", "phony", "physical", "piercing", "pink", "pitiful", "plain", "plaintive", "plastic", "playful", "pleasant", "pleased", "pleasing", "plump", "plush", "polished", "polite", "political", "pointed", "pointless", "poised", "poor", "popular", "portly", "posh", "positive", "possible", "potable", "powerful", "powerless", "practical", "precious", "present", "prestigious", "pretty", "precious", "previous", "pricey", "prickly", "primary", "prime", "pristine", "private", "prize", "probable", "productive", "profitable", "profuse", "proper", "proud", "prudent", "punctual", "pungent", "puny", "pure", "purple", "pushy", "puzzled", "puzzling", "quaint", "qualified", "quarrelsome", "quarterly", "queasy", "querulous", "questionable", "quick", "quick-witted", "quiet", "quintessential", "quirky", "quixotic", "quizzical", "radiant", "ragged", "rapid", "rare", "rash", "raw", "recent", "reckless", "rectangular", "ready", "real", "realistic", "reasonable", "red", "reflecting", "regal", "regular", "reliable", "relieved", "remarkable", "remorseful", "remote", "repentant", "required", "respectful", "responsible", "repulsive", "revolving", "rewarding", "rich", "rigid", "right", "ringed", "ripe", "roasted", "robust", "rosy", "rotating", "rotten", "rough", "round", "rowdy", "royal", "rubbery", "rundown", "ruddy", "runny", "rural", "rusty", "sad", "safe", "salty", "same", "sandy", "sane", "sarcastic", "sardonic", "satisfied", "scaly", "scarce", "scared", "scary", "scented", "scholarly", "scientific", "scratchy", "scrawny", "second", "secondary", "second-hand", "secret", "self-assured", "self-reliant", "selfish", "sentimental", "separate", "serene", "serious", "serpentine", "several", "severe", "shabby", "shadowy", "shady", "shallow", "shameful", "shameless", "sharp", "shimmering", "shiny", "shocked", "shocking", "shoddy", "short", "short-term", "showy", "shrill", "shy", "sick", "silent", "silky", "silly", "silver", "similar", "simple", "simplistic", "sinful", "single", "sizzling", "skeletal", "skinny", "sleepy", "slight", "slim", "slimy", "slippery", "slow", "slushy", "small", "smart", "smoggy", "smooth", "smug", "snappy", "snarling", "sneaky", "sniveling", "snoopy", "sociable", "soft", "soggy", "solid", "somber", "some", "spherical", "sophisticated", "sore", "sorrowful", "soulful", "soupy", "sour", "Spanish", "sparkling", "sparse", "specific", "spectacular", "speedy", "spicy", "spiffy", "spirited", "spiteful", "splendid", "spotless", "spotted", "spry", "square", "squeaky", "squiggly", "stable", "staid", "stained", "stale", "standard", "starchy", "stark", "starry", "steep", "sticky", "stiff", "stimulating", "stingy", "stormy", "straight", "strange", "steel", "strict", "strident", "striking", "striped", "strong", "studious", "stunning", "stupendous", "sturdy", "stylish", "subdued", "submissive", "substantial", "subtle", "suburban", "sudden", "sugary", "sunny", "super", "superb", "superficial", "superior", "supportive", "sure-footed", "surprised", "suspicious", "svelte", "sweet", "sweltering", "swift", "sympathetic", "tall", "talkative", "tame", "tan", "tangible", "tart", "tasty", "tattered", "taut", "tedious", "teeming", "tempting", "tender", "tense", "tepid", "terrible", "terrific", "testy", "thankful", "that", "these", "thick", "thin", "third", "thirsty", "this", "thorough", "thorny", "those", "thoughtful", "threadbare", "thrifty", "thunderous", "tidy", "tight", "timely", "tinted", "tiny", "tired", "torn", "total", "tough", "traumatic", "treasured", "tremendous", "tragic", "trained", "tremendous", "triangular", "tricky", "trifling", "trim", "trivial", "troubled", "true", "trusting", "trustworthy", "trusty", "truthful", "tubby", "turbulent", "twin", "ugly", "ultimate", "unacceptable", "unaware", "uncomfortable", "uncommon", "unconscious", "understated", "unequaled", "uneven", "unfinished", "unfit", "unfolded", "unfortunate", "unhappy", "unhealthy", "uniform", "unimportant", "unique", "united", "unkempt", "unknown", "unlawful", "unlined", "unlucky", "unnatural", "unpleasant", "unrealistic", "unripe", "unruly", "unselfish", "unsightly", "unsteady", "unsung", "untidy", "untimely", "untried", "untrue", "unused", "unusual", "unwelcome", "unwieldy", "unwilling", "unwitting", "unwritten", "upbeat", "upright", "upset", "urban", "usable", "used", "useful", "useless", "utilized", "utter", "vacant", "vague", "vain", "valid", "valuable", "vapid", "variable", "vast", "velvety", "venerated", "vengeful", "verifiable", "vibrant", "vicious", "victorious", "vigilant", "vigorous", "villainous", "violet", "violent", "virtual", "virtuous", "visible", "vital", "vivacious", "vivid", "voluminous", "wan", "warlike", "warm", "warmhearted", "warped", "wary", "wasteful", "watchful", "waterlogged", "watery", "wavy", "wealthy", "weak", "weary", "webbed", "wee", "weekly", "weepy", "weighty", "weird", "welcome", "well-documented", "well-groomed", "well-informed", "well-lit", "well-made", "well-off", "well-to-do", "well-worn", "wet", "which", "whimsical", "whirlwind", "whispered", "white", "whole", "whopping", "wicked", "wide", "wide-eyed", "wiggly", "wild", "willing", "wilted", "winding", "windy", "winged", "wiry", "wise", "witty", "wobbly", "woeful", "wonderful", "wooden", "woozy", "wordy", "worldly", "worn", "worried", "worrisome", "worse", "worst", "worthless", "worthwhile", "worthy", "wrathful", "wretched", "writhing", "wrong", "wry", "yawning", "yearly", "yellow", "yellowish", "young", "youthful", "yummy", "zany", "zealous", "zesty", "zigzag", "rocky"];
var name2 = ["people", "history", "way", "art", "world", "information", "map", "family", "government", "health", "system", "computer", "meat", "year", "thanks", "music", "person", "reading", "method", "data", "food", "understanding", "theory", "law", "bird", "literature", "problem", "software", "control", "knowledge", "power", "ability", "economics", "love", "internet", "television", "science", "library", "nature", "fact", "product", "idea", "temperature", "investment", "area", "society", "activity", "story", "industry", "media", "thing", "oven", "community", "definition", "safety", "quality", "development", "language", "management", "player", "variety", "video", "week", "security", "country", "exam", "movie", "organization", "equipment", "physics", "analysis", "policy", "series", "thought", "basis", "boyfriend", "direction", "strategy", "technology", "army", "camera", "freedom", "paper", "environment", "child", "instance", "month", "truth", "marketing", "university", "writing", "article", "department", "difference", "goal", "news", "audience", "fishing", "growth", "income", "marriage", "user", "combination", "failure", "meaning", "medicine", "philosophy", "teacher", "communication", "night", "chemistry", "disease", "disk", "energy", "nation", "road", "role", "soup", "advertising", "location", "success", "addition", "apartment", "education", "math", "moment", "painting", "politics", "attention", "decision", "event", "property", "shopping", "student", "wood", "competition", "distribution", "entertainment", "office", "population", "president", "unit", "category", "cigarette", "context", "introduction", "opportunity", "performance", "driver", "flight", "length", "magazine", "newspaper", "relationship", "teaching", "cell", "dealer", "debate", "finding", "lake", "member", "message", "phone", "scene", "appearance", "association", "concept", "customer", "death", "discussion", "housing", "inflation", "insurance", "mood", "woman", "advice", "blood", "effort", "expression", "importance", "opinion", "payment", "reality", "responsibility", "situation", "skill", "statement", "wealth", "application", "city", "county", "depth", "estate", "foundation", "grandmother", "heart", "perspective", "photo", "recipe", "studio", "topic", "collection", "depression", "imagination", "passion", "percentage", "resource", "setting", "ad", "agency", "college", "connection", "criticism", "debt", "description", "memory", "patience", "secretary", "solution", "administration", "aspect", "attitude", "director", "personality", "psychology", "recommendation", "response", "selection", "storage", "version", "alcohol", "argument", "complaint", "contract", "emphasis", "highway", "loss", "membership", "possession", "preparation", "steak", "union", "agreement", "cancer", "currency", "employment", "engineering", "entry", "interaction", "limit", "mixture", "preference", "region", "republic", "seat", "tradition", "virus", "actor", "classroom", "delivery", "device", "difficulty", "drama", "election", "engine", "football", "guidance", "hotel", "match", "owner", "priority", "protection", "suggestion", "tension", "variation", "anxiety", "atmosphere", "awareness", "bread", "climate", "comparison", "confusion", "construction", "elevator", "emotion", "employee", "employer", "guest", "height", "leadership", "mall", "manager", "operation", "recording", "respect", "sample", "transportation", "boring", "charity", "cousin", "disaster", "editor", "efficiency", "excitement", "extent", "feedback", "guitar", "homework", "leader", "mom", "outcome", "permission", "presentation", "promotion", "reflection", "refrigerator", "resolution", "revenue", "session", "singer", "tennis", "basket", "bonus", "cabinet", "childhood", "church", "clothes", "coffee", "dinner", "drawing", "hair", "hearing", "initiative", "judgment", "lab", "measurement", "mode", "mud", "orange", "poetry", "police", "possibility", "procedure", "queen", "ratio", "relation", "restaurant", "satisfaction", "sector", "signature", "significance", "song", "tooth", "town", "vehicle", "volume", "wife", "accident", "airport", "appointment", "arrival", "assumption", "baseball", "chapter", "committee", "conversation", "database", "enthusiasm", "error", "explanation", "farmer", "gate", "girl", "hall", "historian", "hospital", "injury", "instruction", "maintenance", "manufacturer", "meal", "perception", "pie", "poem", "presence", "proposal", "reception", "replacement", "revolution", "river", "son", "speech", "tea", "village", "warning", "winner", "worker", "writer", "assistance", "breath", "buyer", "chest", "chocolate", "conclusion", "contribution", "cookie", "courage", "desk", "drawer", "establishment", "examination", "garbage", "grocery", "honey", "impression", "improvement", "independence", "insect", "inspection", "inspector", "king", "ladder", "menu", "penalty", "piano", "potato", "profession", "professor", "quantity", "reaction", "requirement", "salad", "sister", "supermarket", "tongue", "weakness", "wedding", "affair", "ambition", "analyst", "apple", "assignment", "assistant", "bathroom", "bedroom", "beer", "birthday", "celebration", "championship", "cheek", "client", "consequence", "departure", "diamond", "dirt", "ear", "fortune", "friendship", "funeral", "gene", "girlfriend", "hat", "indication", "intention", "lady", "midnight", "negotiation", "obligation", "passenger", "pizza", "platform", "poet", "pollution", "recognition", "reputation", "shirt", "speaker", "stranger", "surgery", "sympathy", "tale", "throat", "trainer", "uncle", "youth", "time", "work", "film", "water", "money", "example", "while", "business", "study", "game", "life", "form", "air", "day", "place", "number", "part", "field", "fish", "back", "process", "heat", "hand", "experience", "job", "book", "end", "point", "type", "home", "economy", "value", "body", "market", "guide", "interest", "state", "radio", "course", "company", "price", "size", "card", "list", "mind", "trade", "line", "care", "group", "risk", "word", "fat", "force", "key", "light", "training", "name", "school", "top", "amount", "level", "order", "practice", "research", "sense", "service", "piece", "web", "boss", "sport", "fun", "house", "page", "term", "test", "answer", "sound", "focus", "matter", "kind", "soil", "board", "oil", "picture", "access", "garden", "range", "rate", "reason", "future", "site", "demand", "exercise", "image", "case", "cause", "coast", "action", "age", "bad", "boat", "record", "result", "section", "building", "mouse", "cash", "class", "period", "plan", "store", "tax", "side", "subject", "space", "rule", "stock", "weather", "chance", "figure", "man", "model", "source", "beginning", "earth", "program", "chicken", "design", "feature", "head", "material", "purpose", "question", "rock", "salt", "act", "birth", "car", "dog", "object", "scale", "sun", "note", "profit", "rent", "speed", "style", "war", "bank", "craft", "half", "inside", "outside", "standard", "bus", "exchange", "eye", "fire", "position", "pressure", "stress", "advantage", "benefit", "box", "frame", "issue", "step", "cycle", "face", "item", "metal", "paint", "review", "room", "screen", "structure", "view", "account", "ball", "discipline", "medium", "share", "balance", "bit", "black", "bottom", "choice", "gift", "impact", "machine", "shape", "tool", "wind", "address", "average", "career", "culture", "morning", "pot", "sign", "table", "task", "condition", "contact", "credit", "egg", "hope", "ice", "network", "north", "square", "attempt", "date", "effect", "link", "post", "star", "voice", "capital", "challenge", "friend", "self", "shot", "brush", "couple", "exit", "front", "function", "lack", "living", "plant", "plastic", "spot", "summer", "taste", "theme", "track", "wing", "brain", "button", "click", "desire", "foot", "gas", "influence", "notice", "rain", "wall", "base", "damage", "distance", "feeling", "pair", "savings", "staff", "sugar", "target", "text", "animal", "author", "budget", "discount", "file", "ground", "lesson", "minute", "officer", "phase", "reference", "register", "sky", "stage", "stick", "title", "trouble", "bowl", "bridge", "campaign", "character", "club", "edge", "evidence", "fan", "letter", "lock", "maximum", "novel", "option", "pack", "park", "quarter", "skin", "sort", "weight", "baby", "background", "carry", "dish", "factor", "fruit", "glass", "joint", "master", "muscle", "red", "strength", "traffic", "trip", "vegetable", "appeal", "chart", "gear", "ideal", "librarychen", "land", "log", "mother", "net", "party", "principle", "relative", "sale", "season", "signal", "spirit", "street", "tree", "wave", "belt", "bench", "commission", "copy", "drop", "minimum", "path", "progress", "project", "sea", "south", "status", "stuff", "ticket", "tour", "angle", "blue", "breakfast", "confidence", "daughter", "degree", "doctor", "dot", "dream", "duty", "essay", "father", "fee", "finance", "hour", "juice", "luck", "milk", "mouth", "peace", "pipe", "stable", "storm", "substance", "team", "trick", "afternoon", "bat", "beach", "blank", "catch", "chain", "consideration", "cream", "crew", "detail", "gold", "interview", "kid", "mark", "mission", "pain", "pleasure", "score", "screw", "sex", "shop", "shower", "suit", "tone", "window", "agent", "band", "bath", "block", "bone", "calendar", "candidate", "cap", "coat", "contest", "corner", "court", "cup", "district", "door", "east", "finger", "garage", "guarantee", "hole", "hook", "implement", "layer", "lecture", "lie", "manner", "meeting", "nose", "parking", "partner", "profile", "rice", "routine", "schedule", "swimming", "telephone", "tip", "winter", "airline", "bag", "battle", "bed", "bill", "bother", "cake", "code", "curve", "designer", "dimension", "dress", "ease", "emergency", "evening", "extension", "farm", "fight", "gap", "grade", "holiday", "horror", "horse", "host", "husband", "loan", "mistake", "mountain", "nail", "noise", "occasion", "package", "patient", "pause", "phrase", "proof", "race", "relief", "sand", "sentence", "shoulder", "smoke", "stomach", "string", "tourist", "towel", "vacation", "west", "wheel", "wine", "arm", "aside", "associate", "bet", "blow", "border", "branch", "breast", "brother", "buddy", "bunch", "chip", "coach", "cross", "document", "draft", "dust", "expert", "floor", "god", "golf", "habit", "iron", "judge", "knife", "landscape", "league", "mail", "mess", "native", "opening", "parent", "pattern", "pin", "pool", "pound", "request", "salary", "shame", "shelter", "shoe", "silver", "tackle", "tank", "trust", "assist", "bake", "bar", "bell", "bike", "blame", "boy", "brick", "chair", "closet", "clue", "collar", "comment", "conference", "devil", "diet", "fear", "fuel", "glove", "jacket", "lunch", "monitor", "mortgage", "nurse", "pace", "panic", "peak", "plane", "reward", "row", "sandwich", "shock", "spite", "spray", "surprise", "till", "transition", "weekend", "welcome", "yard", "alarm", "bend", "bicycle", "bite", "blind", "bottle", "cable", "candle", "clerk", "cloud", "concert", "counter", "flower", "grandfather", "harm", "knee", "lawyer", "leather", "load", "mirror", "neck", "pension", "plate", "purple", "ruin", "ship", "skirt", "slice", "snow", "specialist", "stroke", "switch", "trash", "tune", "zone", "anger", "award", "bid", "bitter", "boot", "bug", "camp", "candy", "carpet", "cat", "champion", "channel", "clock", "comfort", "cow", "crack", "engineer", "entrance", "fault", "grass", "guy", "hell", "highlight", "incident", "island", "joke", "jury", "leg", "lip", "mate", "motor", "nerve", "passage", "pen", "pride", "priest", "prize", "promise", "resident", "resort", "ring", "roof", "rope", "sail", "scheme", "script", "sock", "station", "toe", "tower", "truck", "witness", "can", "will", "other", "use", "make", "good", "look", "help", "go", "great", "being", "still", "public", "read", "keep", "start", "give", "human", "local", "general", "specific", "long", "play", "feel", "high", "put", "common", "set", "change", "simple", "past", "big", "possible", "particular", "major", "personal", "current", "national", "cut", "natural", "physical", "show", "try", "check", "second", "call", "move", "pay", "let", "increase", "single", "individual", "turn", "ask", "buy", "guard", "hold", "main", "offer", "potential", "professional", "international", "travel", "cook", "alternative", "special", "working", "whole", "dance", "excuse", "cold", "commercial", "low", "purchase", "deal", "primary", "worth", "fall", "necessary", "positive", "produce", "search", "present", "spend", "talk", "creative", "tell", "cost", "drive", "green", "support", "glad", "remove", "return", "run", "complex", "due", "effective", "middle", "regular", "reserve", "independent", "leave", "original", "reach", "rest", "serve", "watch", "beautiful", "charge", "active", "break", "negative", "safe", "stay", "visit", "visual", "affect", "cover", "report", "rise", "walk", "white", "junior", "pick", "unique", "classic", "final", "lift", "mix", "private", "stop", "teach", "western", "concern", "familiar", "fly", "official", "broad", "comfortable", "gain", "rich", "save", "stand", "young", "heavy", "lead", "listen", "valuable", "worry", "handle", "leading", "meet", "release", "sell", "finish", "normal", "press", "ride", "secret", "spread", "spring", "tough", "wait", "brown", "deep", "display", "flow", "hit", "objective", "shoot", "touch", "cancel", "chemical", "cry", "dump", "extreme", "push", "conflict", "eat", "fill", "formal", "jump", "kick", "opposite", "pass", "pitch", "remote", "total", "treat", "vast", "abuse", "beat", "burn", "deposit", "print", "raise", "sleep", "somewhere", "advance", "consist", "dark", "double", "draw", "equal", "fix", "hire", "internal", "join", "sensitive", "tap", "win", "attack", "claim", "constant", "drag", "drink", "guess", "minor", "pull", "raw", "soft", "solid", "wear", "weird", "wonder", "annual", "count", "dead", "doubt", "feed", "forever", "impress", "repeat", "round", "sing", "slide", "strip", "wish", "combine", "command", "dig", "divide", "equivalent", "hang", "hunt", "initial", "march", "mention", "spiritual", "survey", "tie", "adult", "brief", "crazy", "escape", "gather", "hate", "prior", "repair", "rough", "sad", "scratch", "sick", "strike", "employ", "external", "hurt", "illegal", "laugh", "lay", "mobile", "nasty", "ordinary", "respond", "royal", "senior", "split", "strain", "struggle", "swim", "train", "upper", "wash", "yellow", "convert", "crash", "dependent", "fold", "funny", "grab", "hide", "miss", "permit", "quote", "recover", "resolve", "roll", "sink", "slip", "spare", "suspect", "sweet", "swing", "twist", "upstairs", "usual", "abroad", "brave", "calm", "concentrate", "estimate", "grand", "male", "mine", "prompt", "quiet", "refuse", "regret", "reveal", "rush", "shake", "shift", "shine", "steal", "suck", "surround", "bear", "brilliant", "dare", "dear", "delay", "drunk", "female", "hurry", "inevitable", "invite", "kiss", "neat", "pop", "punch", "quit", "reply", "representative", "resist", "rip", "rub", "silly", "smile", "spell", "stretch", "tear", "temporary", "tomorrow", "wake", "wrap", "yesterday"];

// pkg/js/utils/task.js
var debounce = (key2, action, delay) => {
  if (key2) {
    clearTimeout(key2);
  }
  if (action && delay) {
    return setTimeout(action, delay);
  }
};
var async = (task) => {
  return async (...args) => {
    await Promise.resolve();
    task(...args);
  };
};
var asyncTask = (task, delayMs) => {
  setTimeout(task, delayMs ?? 0);
};

// pkg/arcs.ts
var { logFactory: logFactory2, Paths: Paths2 } = utils_exports;
var root2 = import.meta.url.split("/").slice(0, -1).join("/");
Paths2.setRoot(root2);
export {
  Arc,
  Chef,
  Composer,
  DataStore,
  Decorator,
  EventEmitter,
  Host,
  Parser,
  ParticleCook,
  Paths2 as Paths,
  Runtime,
  Store,
  Surface,
  fetchParticleCode,
  logFactory2 as logFactory,
  maybeFetchParticleCode,
  pathForKind,
  requireParticleBaseCode,
  requireParticleImplCode,
  utils_exports as utils
};
//# sourceMappingURL=arcs.js.map
