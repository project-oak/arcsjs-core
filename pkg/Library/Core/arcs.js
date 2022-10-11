var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key2, value) => {
  __defNormalProp(obj, typeof key2 !== "symbol" ? key2 + "" : key2, value);
  return value;
};

// js/core/Particle.js
var Particle_exports = {};
__export(Particle_exports, {
  Particle: () => Particle,
  ParticleApi: () => ParticleApi
});
var create4, assign2, keys5, values4, entries5, defineProperty, setPrototypeOf, scope, log8, timeout, nob2, storePrototype, ParticleApi, privateProperty, Particle;
var init_Particle = __esm({
  "js/core/Particle.js"() {
    ({ create: create4, assign: assign2, keys: keys5, values: values4, entries: entries5, defineProperty, setPrototypeOf } = Object);
    scope = globalThis["scope"] ?? {};
    ({ log: log8, timeout } = scope);
    nob2 = () => create4(null);
    storePrototype = new class {
      get empty() {
        return this.length === 0;
      }
      get data() {
        return this;
      }
      get pojo() {
        return this.data;
      }
      get json() {
        return JSON.stringify(this.pojo);
      }
      get pretty() {
        return JSON.stringify(this.pojo, null, "  ");
      }
      get keys() {
        return keys5(this.data);
      }
      get length() {
        return keys5(this.data).length;
      }
      get values() {
        return values4(this.data);
      }
      get entries() {
        return entries5(this.data);
      }
      set(key2, value) {
        this.data[key2] = value;
      }
      setByIndex(index, value) {
        this.data[this.keys[index]] = value;
      }
      add(...values6) {
        values6.forEach((value) => this.data[scope.makeKey()] = value);
      }
      push(...values6) {
        this.add(...values6);
      }
      remove(value) {
        entries5(this.data).find(([key2, entry]) => {
          if (entry === value) {
            delete this.data[key2];
            return true;
          }
        });
      }
      has(key2) {
        return this.data[key2] !== void 0;
      }
      get(key2) {
        return this.getByKey(key2);
      }
      getByKey(key2) {
        return this.data[key2];
      }
      getByIndex(index) {
        return this.data[this.keys[index]];
      }
      delete(key2) {
        delete this.data[key2];
      }
      deleteByIndex(index) {
        delete this.data[this.keys[index]];
      }
      assign(dictionary) {
        assign2(this.data, dictionary);
      }
      map(mapFunc) {
        return this.values.map(mapFunc);
      }
      toString() {
        return this.pretty;
      }
    }();
    ParticleApi = class {
      get template() {
        return null;
      }
      shouldUpdate(inputs, state) {
        return true;
      }
      async update(inputs, state, tools) {
        return null;
      }
      shouldRender(inputs, state) {
        return true;
      }
      render(inputs, state) {
        return null;
      }
    };
    privateProperty = (initialValue) => {
      let value = initialValue;
      return { get: () => value, set: (v) => value = v };
    };
    Particle = class {
      pipe;
      impl;
      internal;
      constructor(proto, pipe, beStateful) {
        this.pipe = pipe;
        this.impl = create4(proto);
        defineProperty(this, "internal", privateProperty(nob2()));
        this.internal.$busy = 0;
        this.internal.beStateful = true;
        this.internal.state = nob2();
      }
      get log() {
        return this.pipe?.log || log8;
      }
      get template() {
        return this.impl?.template;
      }
      get config() {
        return {
          template: this.template
        };
      }
      set inputs(inputs) {
        this.internal.inputs = inputs;
        this.invalidateInputs();
      }
      get inputs() {
        return this.internal.inputs;
      }
      get state() {
        return this.internal.state;
      }
      async service(request) {
        return this.pipe?.service?.(request);
      }
      invalidateInputs() {
        this.internal.$propChanged = true;
        this.invalidate();
      }
      invalidate() {
        if (!this.internal.validator) {
          this.internal.validator = timeout(this.validate.bind(this), 1);
        }
      }
      async(fn) {
        return Promise.resolve().then(fn.bind(this));
      }
      async validate() {
        if (this.internal.validator) {
          try {
            this.internal.$validateAfterBusy = this.internal.$busy;
            if (!this.internal.$busy) {
              if (!this.internal.beStateful) {
                this.internal.state = nob2();
              }
              this.internal.inputs = this.validateInputs();
              await this.maybeUpdate();
            }
          } catch (e) {
            log8.error(e);
          }
          this.internal.validator = null;
          this.internal.$propChanged = false;
        }
      }
      validateInputs() {
        const inputs = assign2(nob2(), this.inputs);
        entries5(inputs).forEach(([key2, value]) => {
          if (value && typeof value === "object") {
            if (!Array.isArray(value)) {
              value = setPrototypeOf({ ...value }, storePrototype);
            }
            inputs[key2] = value;
          }
        });
        return inputs;
      }
      implements(methodName) {
        return typeof this.impl?.[methodName] === "function";
      }
      async maybeUpdate() {
        if (await this.checkInit()) {
          if (!this.canUpdate()) {
            this.outputData(null);
          }
          if (await this.shouldUpdate(this.inputs, this.state)) {
            this.update();
          }
        }
      }
      async checkInit() {
        if (!this.internal.initialized) {
          this.internal.initialized = true;
          if (this.implements("initialize")) {
            await this.asyncMethod(this.impl.initialize);
          }
        }
        return true;
      }
      canUpdate() {
        return this.implements("update");
      }
      async shouldUpdate(inputs, state) {
        return !this.impl?.shouldUpdate || await this.impl.shouldUpdate(inputs, state) !== false;
      }
      update() {
        this.asyncMethod(this.impl?.update);
      }
      outputData(data) {
        this.pipe?.output?.(data, this.maybeRender());
      }
      maybeRender() {
        if (this.template) {
          const { inputs, state } = this.internal;
          if (this.impl?.shouldRender?.(inputs, state) !== false) {
            if (this.implements("render")) {
              return this.impl.render(inputs, state);
            } else {
              return { ...inputs, ...state };
            }
          }
        }
      }
      async handleEvent({ handler, data }) {
        const onhandler = this.impl?.[handler];
        if (onhandler) {
          this.internal.inputs.eventlet = data;
          await this.asyncMethod(onhandler.bind(this.impl), { eventlet: data });
          this.internal.inputs.eventlet = null;
        } else {
        }
      }
      async asyncMethod(asyncMethod, injections) {
        if (asyncMethod) {
          const { inputs, state } = this.internal;
          const stdlib = {
            service: async (request) => this.service(request),
            invalidate: () => this.invalidate(),
            output: async (data) => this.outputData(data)
          };
          const task = asyncMethod.bind(this.impl, inputs, state, { ...stdlib, ...injections });
          this.outputData(await this.try(task));
          if (!this.internal.$busy && this.internal.$validateAfterBusy) {
            this.invalidate();
          }
        }
      }
      async try(asyncFunc) {
        this.internal.$busy++;
        try {
          return await asyncFunc();
        } catch (e) {
          log8.error(e);
        } finally {
          this.internal.$busy--;
        }
      }
    };
    scope.harden(globalThis);
    scope.harden(Particle);
  }
});

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
  const log10 = loggers.log;
  Object.assign(log10, loggers);
  return log10;
};
logFactory.flags = globalThis.config?.logFlags || {};

// js/core/Arc.js
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
    const output = outputs?.find((output2) => keys(output2 || 0)[0] === name);
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
    arc.addHost(host);
    return host;
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
      return this.persistor.persist?.(storeId, store);
    }
  }
  async restoreStore(storeId, store) {
    if (store.shouldPersist()) {
      this.log(`restoreStore "${storeId}"`);
      return this.persistor.restore?.(storeId);
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

// js/recipe/RecipeParser.js
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
    let value = meta?.value;
    let store = mapStore(runtime, meta);
    if (store) {
      log4(`realizeStore: mapped "${rawMeta.name}" to "${store.meta.name}"`);
    } else {
      store = runtime.createStore(meta);
      log4(`realizeStore: created "${meta.name}"`);
      runtime.addStore(meta.name, store);
      if (store.shouldPersist()) {
        const cached = await store.restore();
        value = cached === void 0 ? value : cached;
      }
    }
    if (value !== void 0) {
      log4(`setting data to:`, value);
      store.data = value;
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
      console.warn(`Particle '${spec.$kind}' spec contains deprecated $bindings property (${JSON.stringify(spec.$bindings)})`);
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
};

// js/recipe/Chef.js
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
var log7 = logFactory(logFactory.flags.code, "code", "gold");
var defaultParticleBasePath = "$arcs/js/core/Particle.js";
var requireParticleBaseCode = async (sourcePath) => {
  if (!requireParticleBaseCode.source) {
    const path = Paths.resolve(sourcePath || defaultParticleBasePath);
    log7("particle base code path: ", path);
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
  log7.error(`fetchParticleCode: empty 'kind'`);
};
var maybeFetchParticleCode = async (kind) => {
  const path = pathForKind(kind);
  try {
    const response = await fetch(path);
    return await response.text();
  } catch (x) {
    log7.error(`could not locate implementation for particle "${kind}" [${path}]`);
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

// js/isolation/vanilla.js
var log9 = logFactory(logFactory.flags.isolation, "vanilla", "goldenrod");
var harden = (object) => object;
globalThis.harden = harden;
globalThis.scope = {
  harden
};
var makeKey = () => `i${Math.floor((1 + Math.random() * 9) * 1e14)}`;
var timeout2 = async (func, delayMs) => new Promise((resolve2) => setTimeout(() => resolve2(func()), delayMs));
var initVanilla = (options) => {
  try {
    log9(deepEqual);
    const utils = { log: log9, resolve, html, makeKey, deepEqual, timeout: timeout2 };
    const scope2 = {
      ...utils,
      ...options?.injections
    };
    Object.assign(globalThis.scope, scope2);
    Object.assign(globalThis, scope2);
  } finally {
  }
};
var resolve = Paths.resolve.bind(Paths);
var html = (strings, ...values6) => `${strings[0]}${values6.map((v, i) => `${v}${strings[i + 1]}`).join("")}`.trim();
var createParticleFactory = async (kind, options) => {
  const { Particle: Particle2 } = await Promise.resolve().then(() => (init_Particle(), Particle_exports));
  const implFactory = await requireImplFactory(kind, options);
  const log10 = createLogger(kind);
  const injections = { log: log10, resolve, html, ...options?.injections };
  const proto = implFactory(injections);
  const particleFactory = (host) => {
    const pipe = {
      log: log10,
      output: host.output.bind(host),
      service: host.service.bind(host)
    };
    return new Particle2(proto, pipe, true);
  };
  return particleFactory;
};
var requireImplFactory = async (kind, options) => {
  const implCode = await requireParticleImplCode(kind, options);
  let factory = (0, eval)(implCode);
  if (typeof factory === "object") {
    factory = repackageImplFactory(factory, kind);
    log9("repackaged factory:\n", factory);
  }
  return globalThis.harden(factory);
};
var { assign: assign3, keys: keys6, entries: entries6, values: values5, create: create5 } = Object;
globalThis.SafeObject = {
  create: create5,
  assign: assign3,
  keys(o) {
    return o ? keys6(o) : [];
  },
  values(o) {
    return o ? values5(o) : [];
  },
  entries(o) {
    return o ? entries6(o) : [];
  },
  mapBy(a, keyGetter) {
    return a ? values5(a).reduce((map, item) => (map[keyGetter(item)] = item, map), {}) : {};
  }
};
var repackageImplFactory = (factory, kind) => {
  const { constNames, rewriteConsts, funcNames, rewriteFuncs } = collectDecls(factory);
  const proto = `{${[...constNames, ...funcNames]}}`;
  const moduleRewrite = `
({log, ...utils}) => {
// protect utils
globalThis.harden(utils);
// these are just handy
const {assign, keys, entries, values, create, mapBy} = globalThis.SafeObject;
// declarations
${[...rewriteConsts, ...rewriteFuncs].join("\n\n")}
// hardened Object (map) of declarations,
// suitable to be a prototype
return globalThis.harden(${proto});
// name the file for debuggers
//# sourceURL=sandbox/${pathForKind(kind).split("/").pop()}
};
  `;
  log9("rewritten:\n\n", moduleRewrite);
  return (0, eval)(moduleRewrite);
};
var collectDecls = (factory) => {
  const props = Object.entries(factory);
  const isFunc = ([n, p]) => typeof p === "function";
  const isForbidden = ([n, p]) => n == "harden" || n == "globalThis";
  const funcs = props.filter((item) => isFunc(item) && !isForbidden(item));
  const rewriteFuncs = funcs.map(([n, f]) => {
    const code = f?.toString?.() ?? "";
    const async2 = code.includes("async");
    const body = code.replace("async ", "").replace("function ", "");
    return `${async2 ? "async" : ""} function ${body};`;
  });
  const funcNames = funcs.map(([n]) => n);
  const consts = props.filter((item) => !isFunc(item) && !isForbidden(item));
  const rewriteConsts = consts.map(([n, p]) => {
    return `const ${n} = \`${p}\`;`;
  });
  const constNames = consts.map(([n]) => n);
  return {
    constNames,
    rewriteConsts,
    funcNames,
    rewriteFuncs
  };
};
var createLogger = (kind) => {
  const _log = logFactory(logFactory.flags.particles, kind, "#002266");
  return (msg, ...args) => {
    const stack = msg?.stack?.split("\n")?.slice(1, 2) || new Error().stack?.split("\n").slice(2, 3);
    const where = stack.map((entry) => entry.replace(/\([^()]*?\)/, "").replace(/ \([^()]*?\)/, "").replace("<anonymous>, <anonymous>", "").replace("Object.", "").replace("eval at :", "").replace(/\(|\)/g, "").replace(/\[[^\]]*?\] /, "").replace(/at (.*) (\d)/, 'at "$1" $2')).reverse().join("\n").trim();
    if (msg?.message) {
      _log.error(msg.message, ...args, `(${where})`);
    } else {
      _log(msg, ...args, `(${where})`);
    }
  };
};
Runtime.particleIndustry = createParticleFactory;
Runtime.securityLockdown = initVanilla;

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
  Host,
  Parser,
  ParticleCook,
  Paths2 as Paths,
  Runtime,
  Store,
  StoreCook,
  fetchParticleCode,
  initVanilla,
  logFactory2 as logFactory,
  maybeFetchParticleCode,
  pathForKind,
  requireParticleBaseCode,
  requireParticleImplCode,
  utils_exports as utils
};
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
//# sourceMappingURL=arcs.js.map
