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

// js/core/EventEmitter.js
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

// js/utils/types.js
var logKinds = ["log", "group", "groupCollapsed", "groupEnd", "dir"];
var errKinds = ["warn", "error"];

// js/utils/log.js
var { fromEntries } = Object;
var _logFactory = (enable, preamble, bg, color, kind = "log") => {
  if (typeof enable === "string") {
    enable = logFactory.flags[enable];
  }
  if (!enable) {
    return () => {
    };
  }
  if (kind === "dir") {
    return console.dir.bind(console);
  }
  const style = `background: ${bg || "gray"}; color: ${color || "white"}; padding: 1px 6px 2px 7px; border-radius: 6px 0 0 6px;`;
  return console[kind].bind(console, `%c${preamble}`, style);
};
var logFactory = (enable, preamble, bg = "", color = "") => {
  const debugLoggers = fromEntries(logKinds.map((kind) => [kind, _logFactory(enable, preamble, bg, color, kind)]));
  const errorLoggers = fromEntries(errKinds.map((kind) => [kind, _logFactory(true, preamble, bg, color, kind)]));
  const loggers = { ...debugLoggers, ...errorLoggers };
  const log9 = loggers.log;
  Object.assign(log9, loggers);
  return log9;
};
logFactory.flags = globalThis.config?.logFlags || {};

// js/core/Arc.js
var customLogFactory = (id) => logFactory(logFactory.flags.arc, `Arc (${id})`, "slateblue");
var { assign, create } = Object;
var entries = (o) => Object.entries(o ?? Object);
var keys = (o) => Object.keys(o ?? Object);
var values = (o) => Object.values(o ?? Object);
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
  rerender() {
    values(this.hosts).forEach((h) => h.rerender());
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
    const isBound = (inputs) => inputs && inputs.some((input) => input && (values(input)[0] == storeId || keys(input)[0] == storeId));
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
    const bindings = host.meta?.inputs;
    if (bindings === "*") {
      entries(this.stores).forEach(([name, store]) => inputs[name] = store.pojo);
    } else {
      assign(inputs, host.meta?.staticInputs);
      bindings?.filter((b) => b).forEach((b) => {
        const [prop, binding] = entries(b).pop() || [];
        if (prop && binding) {
          const value = this.stores[binding]?.pojo;
          if (value !== void 0) {
            inputs[prop] = value;
          }
        }
      });
      this.log(`computeInputs(${host.id}) =`, inputs);
    }
    return inputs;
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
    const output = outputs?.find((output2) => keys(output2 || 0)[0] === name);
    if (output) {
      return values(output)[0];
    }
  }
  async render(packet) {
    if (this.composer) {
      this.composer.render({ ...packet, arcid: this.id });
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

// js/utils/object.js
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

// js/utils/rand.js
var { floor, pow, random } = Math;
var key = (digits) => floor((1 + random() * 9) * pow(10, digits - 1));
var irand = (range) => floor(random() * range);
var arand = (array) => array[irand(array.length)];
var prob = (probability) => Boolean(random() < probability);

// js/core/Decorator.js
var log = logFactory(logFactory.flags.decorator, "Decorator", "plum");
var { values: values2, entries: entries2 } = Object;
var opaqueData = {};
var Decorator = {
  setOpaqueData(name, data) {
    opaqueData[name] = data;
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
    if (models) {
      models = maybeDecorate(models, item.decorator, particle);
      models = maybeFilter(models, item.filter, particle.impl);
      models = maybeCollateBy(models, item);
      item.models = models;
    }
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

// js/core/Host.js
var { entries: entries3, keys: keys2 } = Object;
var customLogFactory2 = (id) => logFactory(logFactory.flags.host, `Host (${id})`, arand(["#5a189a", "#51168b", "#48137b", "#6b2fa4", "#7b46ae", "#3f116c"]));
var Host = class extends EventEmitter {
  arc;
  id;
  lastOutput;
  lastPacket;
  lastRenderModel;
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
    this.fire("eventlet", eventlet);
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
    if (this.particle) {
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
      this.fire("output", outputModel);
    }
    if (this.template) {
      Decorator.maybeDecorateModel(renderModel, this.particle);
      this.lastRenderModel = { ...renderModel };
      this.render(renderModel);
    }
  }
  rerender() {
    if (this.lastRenderModel) {
      this.render(this.lastRenderModel);
    }
  }
  render(model) {
    const { id, container, template } = this;
    const content = { model, template };
    const packet = { id, container, content };
    this.fire("render", packet);
    this.arc?.render(packet);
    this.lastPacket = packet;
  }
  set inputs(inputs) {
    if (this.particle && inputs) {
      const lastInputs = this.particle.internal.inputs;
      if (this.dirtyCheck(inputs, lastInputs, this.lastOutput)) {
        this.particle.inputs = deepCopy({ ...this.meta?.staticInputs, ...inputs });
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

// js/core/Store.js
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
  shouldPersist() {
    return this.is("persisted") && !this.is("volatile");
  }
  async doChange() {
    this.persist();
    return super.doChange();
  }
  async persist() {
  }
  async restore() {
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

// js/utils/id.js
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

// js/Runtime.js
var log2 = logFactory(logFactory.flags.runtime, "runtime", "#873600");
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
    this.log = logFactory(logFactory.flags.runtime, `runtime:[${this.prettyUid}]`, "#873600");
  }
  setUid(uid) {
    this.uid = uid;
    this.nid = `${uid}:${makeId(1, 2)}`;
    this.prettyUid = uid.substring(0, uid.indexOf("@") + 1) || uid;
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
    await arc.addHost(host);
    log2("bootstrapped particle", id);
    return host;
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
    return host.installParticle(particle, particleMeta);
  }
  async installParticle(arc, particleMeta, name) {
    this.log("installParticle", name, particleMeta, arc.id);
    name = name || makeId();
    if (arc.hosts[name]) {
      let n = 1;
      for (; arc.hosts[`${name}-${n}`]; n++)
        ;
      name = `${name}-${n}`;
    }
    const host = new Host(name);
    await this.marshalParticle(host, particleMeta);
    await arc.addHost(host);
    return host;
  }
  async addParticle(arc, host, particleMeta, name) {
    this.log("addParticle", arc.id, name, particleMeta, arc.id);
    await this.marshalParticle(host, particleMeta);
    await arc.addHost(host);
    return host;
  }
  idFromName(name, list) {
    let id = name || makeId();
    if (list[id]) {
      let n = 1;
      for (; list[`${id}-${n}`]; n++)
        ;
      id = `${id}-${n}`;
    }
    return id;
  }
  addStore(storeId, store) {
    if (store.marshal) {
      store.marshal(this);
    }
    store.persist = async () => this.persistStore(storeId, store);
    store.restore = async () => this.restoreStore(storeId, store);
    const name = `${this.nid}:${storeId}-changed`;
    const onChange = this.storeChanged.bind(this, storeId);
    store.listen("change", onChange, name);
    this.stores[storeId] = store;
    this.maybeShareStore(storeId);
  }
  async persistStore(storeId, store) {
    if (store.shouldPersist()) {
      this.log(`persistStore "${storeId}"`);
      return this.persistor?.persist?.(storeId, store.data);
    }
  }
  async restoreStore(storeId, store) {
    if (store.shouldPersist()) {
      this.log(`restoreStore "${storeId}"`);
      return this.persistor?.restore?.(storeId);
    }
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
      return factory?.(host);
    } catch (x) {
      log2.error(`createParticle(${kind}):`, x);
    }
  }
  async marshalParticleFactory(kind) {
    return particleFactoryCache[kind] ?? this.lateBindParticle(kind);
  }
  lateBindParticle(kind, code) {
    const { particleOptions, particleIndustry, registerFactoryPromise } = _Runtime;
    if (!particleIndustry) {
      throw `no ParticleIndustry to create '${kind}'`;
    } else {
      const factoryPromise = particleIndustry(kind, { ...particleOptions, code });
      registerFactoryPromise(kind, factoryPromise);
      return factoryPromise;
    }
  }
  static registerFactoryPromise(kind, factoryPromise) {
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

// js/recipe/RecipeParser.js
var log3 = logFactory(logFactory.flags.recipe, "RecipeParser", "violet");
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
      log3("duplicate particle name", id, spec);
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

// js/utils/matching.js
function matches(candidateMeta, targetMeta) {
  for (const property in targetMeta) {
    if (candidateMeta[property] !== targetMeta[property]) {
      return false;
    }
  }
  return true;
}

// js/recipe/StoreCook.js
var log4 = logFactory(logFactory.flags.recipe, "StoreCook", "#99bb15");
var { values: values3 } = Object;
var mapStore = (runtime, { name, type }) => {
  return findStores(runtime, { name, type })?.[0];
};
var findStores = (runtime, criteria) => {
  return values3(runtime.stores).filter((store) => storeMatches(store, criteria));
};
var storeMatches = (store, criteria) => {
  const { type, ...other } = criteria;
  if (typeMatches(type, store?.meta.type)) {
    return matches(store?.meta, other);
  }
};
var typeMatches = (typeA, typeB) => {
  const baseTypes = ["pojo", "json"];
  return typeA === typeB || baseTypes.includes(typeA?.toLowerCase()) || baseTypes.includes(typeB?.toLowerCase());
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
    let value;
    const meta = this.constructMeta(runtime, arc, rawMeta);
    let store = mapStore(runtime, meta);
    if (store) {
      log4(`realizeStore: mapping "${rawMeta.name}" to "${store.meta.name}"`);
    } else {
      log4(`realizeStore: creating "${meta.name}"`);
      store = StoreCook.createStore(runtime, meta);
      value = meta?.value;
      if (store.shouldPersist()) {
        const cached = await store.restore();
        value = cached == null ? value : cached;
      }
    }
    arc.addStore(meta.name, store);
    if (value !== void 0) {
      log4(`setting data to:`, value);
      store.data = value;
    }
  }
  static createStore(runtime, meta) {
    const store = runtime.createStore(meta);
    runtime.addStore(meta.name, store);
    return store;
  }
  static async derealizeStore(runtime, arc, meta) {
    log4(`derealizeStore: derealizing "${meta.name}"`);
    runtime.removeStore(meta.name);
    arc.removeStore(meta.name);
  }
  static async removeStores(runtime, arc, storeNames) {
    storeNames.forEach((name) => {
      runtime.removeStore(name);
      arc.removeStore(name);
    });
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
  static specToMeta(name, spec) {
    return {
      name,
      type: spec.$type,
      tags: spec.$tags,
      value: spec.$value
    };
  }
};

// js/recipe/ParticleCook.js
var log5 = logFactory(logFactory.flags.recipe, "ParticleCook", "#5fa530");
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
    if (spec.$bindings) {
      log5.warn(`Particle '${spec.$kind}' spec contains deprecated $bindings property (${JSON.stringify(spec.$bindings)})`);
    }
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
  static async removeParticles(arc, particleIds) {
    particleIds.forEach((id) => arc.removeHost(id));
  }
};

// js/recipe/Chef.js
var log6 = logFactory(logFactory.flags.recipe, "Chef", "#087f23");
var Chef = class {
  static async execute(recipe, runtime, arc) {
    if (arc instanceof Promise) {
      log6.error("`arc` must be an Arc, not a Promise. Make sure `boostrapArc` is awaited.");
      return;
    }
    log6("|-->...| executing recipe: ", recipe);
    const plan = new Parser(recipe);
    await StoreCook.execute(runtime, arc, plan.stores);
    await ParticleCook.execute(runtime, arc, plan.particles);
    arc.meta = { ...arc.meta, ...plan.meta };
    log6("|...-->| recipe complete: ", recipe.$meta ?? "");
  }
  static async evacipate(recipe, runtime, arc) {
    log6("|-->...| evacipating recipe: ", recipe.$meta);
    const plan = new Parser(recipe);
    await StoreCook.evacipate(runtime, arc, plan.stores);
    await ParticleCook.evacipate(runtime, arc, plan.particles);
    log6("|...-->| recipe evacipated: ", recipe.$meta);
  }
  static async executeAll(recipes, runtime, arc) {
    for (const recipe of recipes) {
      await this.execute(recipe, runtime, arc);
    }
  }
  static async evacipateAll(recipes, runtime, arc) {
    for (const recipe of recipes) {
      await this.evacipate(recipe, runtime, arc);
    }
  }
};

// js/recipe/Graphinator.js
var log7 = logFactory(logFactory.flags.graph, "Graphinator", "#7f0823");
var { assign: assign2, create: create4 } = Object;
var entries5 = (o) => Object.entries(o ?? Object);
var keys5 = (o) => Object.keys(o ?? Object);
var values4 = (o) => Object.values(o ?? Object);
var idDelim = ":";
var Graphinator = class {
  runtime;
  arc;
  nodeTypes;
  storeTags;
  constructor(nodeTypes, runtime, arc) {
    this.runtime = runtime;
    this.arc = arc;
    this.nodeTypes = {};
    this.storeTags = {};
    keys5(nodeTypes).forEach((t) => this.nodeTypes[t] = this.flattenNodeType(nodeTypes[t]));
  }
  flattenNodeType(nodeType, $container, flatNodeType) {
    flatNodeType ??= {};
    keys5(nodeType).forEach((key2) => {
      if (key2.startsWith("$")) {
        flatNodeType[key2] = { ...nodeType[key2], ...flatNodeType[key2] || {} };
      } else {
        assign2(flatNodeType, this.flattenParticleSpec(key2, nodeType[key2], $container, flatNodeType));
      }
    });
    return flatNodeType;
  }
  flattenParticleSpec(particleId, particleSpec, $container, flatNodeType) {
    const flattened = {
      [particleId]: {
        ...particleSpec,
        $slots: {},
        ...$container && { $container }
      }
    };
    entries5(particleSpec.$slots || {}).forEach(([slotId, slotRecipe]) => {
      assign2(flattened, this.flattenNodeType(slotRecipe, `${particleId}#${slotId}`, flatNodeType));
      flattened[particleId].$slots[slotId] = {};
    });
    return flattened;
  }
  async execute(graph, { id: layoutId, defaultContainer }) {
    const layout = graph.layout?.[layoutId || "preview"];
    const stores = [];
    const particles = [];
    values4(graph.nodes).forEach((node) => {
      const nodeType = this.nodeTypes[node.type];
      if (!nodeType) {
        throw `node.type "${node.type}" not found`;
      }
      const connsMap = {};
      this.prepareStores(node, nodeType, stores, connsMap);
      this.prepareParticles(node, layout, defaultContainer, connsMap, particles);
    });
    this.retagStoreSpecs(stores);
    log7("Executing", { graph, stores, particles });
    await StoreCook.execute(this.runtime, this.arc, stores);
    await this.realizeParticles(particles);
    return particles.map(({ id }) => id);
  }
  prepareStores({ id, connections, props }, nodeType, stores, connsMap) {
    entries5(nodeType.$stores).forEach(([name, store]) => {
      connsMap[name] = [];
      const storeId = this.constructId(id, name);
      const storeValue = props?.[name] || store.$value;
      const storeConns = connections?.[name];
      this.prepareStore(storeId, store, storeValue, storeConns, stores, connsMap[name]);
    });
  }
  prepareStore(storeId, { $type: type, $tags }, value, connections, stores, storeEntry) {
    if (connections) {
      connections?.forEach?.((connId) => this.addStore(connId, $tags, storeEntry));
    } else {
      stores.push({ name: storeId, type, value });
      this.addStore(storeId, $tags, storeEntry);
    }
  }
  addStore(storeId, tags, storeEntry) {
    storeEntry.push({ id: storeId });
    this.storeTags[storeId] = [...this.storeTags[storeId] || [], ...tags || []];
  }
  retagStoreSpecs(stores) {
    stores.forEach((store) => store.tags = this.storeTags[store.name]);
  }
  resolveIoGroup(bindings, storeMap) {
    return bindings?.map((coded) => {
      const { key: key2, binding } = this.decodeBinding(coded);
      const task = (store, index) => ({ [`${key2}${index === 0 ? "" : index}`]: store });
      return storeMap[binding || key2]?.map(({ id }, i) => task(id, i));
    }).flat().filter((i) => i);
  }
  decodeBinding(value) {
    if (typeof value === "string") {
      return { key: value, binding: "" };
    } else {
      const [key2, binding] = entries5(value)[0];
      return { key: key2, binding };
    }
  }
  prepareParticles(node, layout, defaultContainer, storeMap, particles) {
    const nodeType = this.nodeTypes[node.type];
    const containerId = this.constructId(node.id, "Container");
    const container = layout?.[containerId] || defaultContainer;
    this.getNodeParticleNames(nodeType).forEach((name) => {
      particles.push(this.prepareParticle(node, name, container, nodeType, storeMap));
    });
  }
  prepareParticle({ id, props }, particleName, container, nodeType, storeMap) {
    const particleId = this.constructId(id, particleName);
    const spec = nodeType[particleName];
    const $staticInputs = Object.assign({}, props || {}, spec.$staticInputs || {});
    return {
      id: particleId,
      spec: {
        $kind: spec.$kind,
        $staticInputs,
        $inputs: this.resolveIoGroup(spec.$inputs, storeMap),
        $outputs: this.resolveIoGroup(spec.$outputs, storeMap),
        $slots: {},
        $container: this.resolveContainer(id, spec.$container, container)
      }
    };
  }
  constructId(id, name) {
    return `${id ? `${id}${idDelim}` : ""}${name}`;
  }
  resolveContainer(id, containerName, defaultContainer) {
    return containerName ? this.constructId(id, containerName) : defaultContainer;
  }
  async realizeParticles(particles) {
    const runningParticles = particles.filter(({ id }) => this.arc.hosts[id]);
    runningParticles.forEach((particle) => this.updateParticleHosts(particle));
    const newParticles = particles.filter(({ id }) => !this.arc.hosts[id]);
    await ParticleCook.execute(this.runtime, this.arc, newParticles);
    const removedParticles = this.findRemovedParticles(particles);
    await ParticleCook.evacipate(this.runtime, this.arc, removedParticles);
  }
  findRemovedParticles(particles) {
    const runningGraphParticleIds = keys5(this.arc.hosts).filter((id) => {
      const container = this.arc.hosts[id].meta.container;
      if (container?.includes("designer#graph")) {
        return true;
      }
      const containerParticle = container?.split("#")?.[0];
      return particles.some(({ id: id2 }) => id2 === containerParticle);
    });
    const removedParticleIds = runningGraphParticleIds.filter((id) => !particles.some(({ id: graphId }) => id === graphId));
    return removedParticleIds.map((id) => ({ id }));
  }
  updateParticleHosts({ id, spec }) {
    const host = this.arc.hosts[id];
    if (host.container !== spec.$container) {
      host.meta.container = spec.$container;
      Object.values(this.arc.hosts).forEach((host2) => host2.rerender());
    }
    const meta = ParticleCook.specToMeta(spec);
    if (!deepEqual(meta, host.meta)) {
      host.meta = meta;
      this.arc.updateHost(host);
    }
  }
  async evacipate(graph) {
    log7("Evacipating graph", graph);
    await StoreCook.removeStores(this.runtime, this.arc, this.getStoreNames(graph));
    await ParticleCook.removeParticles(this.arc, this.getParticleNames(graph));
  }
  getParticleNames(graph) {
    const names = [];
    values4(graph.nodes).forEach(({ id, type }) => {
      this.getNodeParticleNames(this.nodeTypes[type]).forEach((name) => names.push(this.constructId(id, name)));
    });
    return names;
  }
  getNodeParticleNames(nodeType) {
    return keys5(nodeType).filter((id) => !id.startsWith("$"));
  }
  getStoreNames(graph) {
    const names = [];
    values4(graph.nodes).forEach(({ id, type }) => {
      const nodeType = this.nodeTypes[type];
      keys5(nodeType.$stores).forEach((storeId) => {
        names.push(this.constructId(id, storeId));
      });
    });
    return names;
  }
};

// js/isolation/code.js
var code_exports = {};
__export(code_exports, {
  fetchParticleCode: () => fetchParticleCode,
  maybeFetchParticleCode: () => maybeFetchParticleCode,
  pathForKind: () => pathForKind,
  requireParticleBaseCode: () => requireParticleBaseCode,
  requireParticleImplCode: () => requireParticleImplCode
});

// js/utils/paths.js
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
    let last;
    do {
      path = this._resolve(last = path);
    } while (last !== path);
    return path;
  }
  _resolve(path) {
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
    if (!globalThis?.document) {
      return localRelative;
    } else {
      let base = document.URL;
      if (base[base.length - 1] !== "/") {
        base = `${base.split("/").slice(0, -1).join("/")}/`;
      }
      let localAbsolute = new URL(localRelative, base).href;
      if (localAbsolute[localAbsolute.length - 1] === "/") {
        localAbsolute = localAbsolute.slice(0, -1);
      }
      return localAbsolute;
    }
  }
};
var root = import.meta.url.split("/").slice(0, -3).join("/");
var Paths = globalThis["Paths"] = new PathMapper(root);
Paths.add(globalThis.config?.paths);

// js/isolation/code.js
var log8 = logFactory(logFactory.flags.code, "code", "gold", "#333");
var defaultParticleBasePath = "$arcs/core/Particle.js";
var requireParticleImplCode = async (kind, options) => {
  const code = options?.code || await fetchParticleCode(kind);
  return code.slice(code.indexOf("({"));
};
var fetchParticleCode = async (kind) => {
  if (kind) {
    return await maybeFetchParticleCode(kind);
  }
  log8.error(`fetchParticleCode: empty 'kind'`);
};
var maybeFetchParticleCode = async (kind) => {
  const path = pathForKind(kind);
  try {
    const response = await fetch(path);
    if (response.ok) {
      return await response.text();
    } else {
      throw "";
    }
  } catch (x) {
    log8.error(`could not locate implementation for particle "${kind}" [${path}]`);
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
var requireParticleBaseCode = async (sourcePath) => {
  if (!requireParticleBaseCode.source) {
    const path = Paths.resolve(sourcePath || defaultParticleBasePath);
    log8("particle base code path: ", path);
    const response = await fetch(path);
    const moduleText = await response.text() + "\n//# sourceURL=" + path + "\n";
    requireParticleBaseCode.source = moduleText.replace(/export /g, "");
  }
  return requireParticleBaseCode.source;
};
requireParticleBaseCode.source = null;

// js/utils/utils.js
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
  key: () => key,
  logFactory: () => logFactory,
  makeId: () => makeId,
  matches: () => matches,
  prob: () => prob,
  shallowMerge: () => shallowMerge,
  shallowUpdate: () => shallowUpdate
});

// js/utils/date.js
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

// js/utils/task.js
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

// src/arcs.ts
var { logFactory: logFactory2, Paths: Paths2 } = utils_exports;
var root2 = import.meta.url.split("/").slice(0, -1).join("/");
Paths2.setRoot(root2);
export {
  Arc,
  Chef,
  DataStore,
  Decorator,
  EventEmitter,
  Graphinator,
  Host,
  Parser,
  ParticleCook,
  Paths2 as Paths,
  Runtime,
  Store,
  StoreCook,
  code_exports as code,
  logFactory2 as logFactory,
  utils_exports as utils
};
/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
//# sourceMappingURL=arcs.js.map
