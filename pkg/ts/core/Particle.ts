/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

/*
 * PSA: code in this file is subject to isolation restrictions, including runtime processing.
 * Particle module interfaces with 3p code, and is often loaded into isolation contexts.
**/

const {create, assign, keys, values, entries, defineProperty, setPrototypeOf} = Object;
const {log, harden, timeout} = globalThis as unknown as {log, harden, timeout};
const nob = () => create(null);

// yay lambda, he gets a semi-colon ... named classes not so much
const storePrototype = new class {
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
    return JSON.stringify(this.pojo, null, '  ');
  }
  get keys() {
    return keys(this.data);
  }
  get length() {
    return keys(this.data).length;
  }
  get values() {
    return values(this.data);
  }
  get entries() {
    return entries(this.data);
  }
  set(key, value) {
    this.data[key] = value;
  }
  setByIndex(index, value) {
    this.data[this.keys[index]] = value;
  }
  add(...values) {
    values.forEach(value => this.data[globalThis.makeKey()] = value);
  }
  push(...values) {
    this.add(...values);
  }
  remove(value) {
    entries(this.data).find(([key, entry]) => {
      if (entry === value) {
        delete this.data[key];
        return true;
      }
    });
  }
  has(key) {
    return this.data[key] !== undefined;
  }
  get(key) {
    return this.getByKey(key);
  }
  getByKey(key) {
    return this.data[key];
  }
  getByIndex(index) {
    return this.data[this.keys[index]];
  }
  delete(key) {
    delete this.data[key];
  }
  deleteByIndex(index) {
    delete this.data[this.keys[index]];
  }
  assign(dictionary) {
    assign(this.data, dictionary);
  }
  map(mapFunc) {
    return this.values.map(mapFunc);
  }
  toString() {
    return this.pretty;
  }
};

export interface Eventlet {
  handler;
  data;
}

/**
 * ParticleAPI functions are called at various points in the particle's lifecycle.
 * Developers should override these functions as needed to give a particle
 * functionality.
 */
export class ParticleApi {
  /**
   * Particles that render on a surface should provide a template. The template
   * can include double curly bracketed keys that will be interpolated at
   * runtime.
   *
   * To dynamically change the template, we double curly braced keys must be
   * the only thing inside a div or span:
   * ```
   * <span>{{key}}</span>.
   * <div>{{key}}</div>
   * ```
   *
   * The value for each key is returned from the {@link render | render method}.
   *
   * Double curly bracketed keys can also be placed inside div definitions to
   * change attributes. In this instance we place them inside quotation marks.
   * For example:
   * ```
   * <div class=”{{classKey}}" hidden="{{hideKey}}">
   * ```
   */
  get template() {
    return null;
  }
  /**
   * shouldUpdate returns a boolean that indicates if runtime should update
   * when inputs or state change.
   *
   * This function can be overwritten to implement the desired
   * behaviour.
   *
   * @param inputs
   * @param state
   *
   * @returns a boolean to indicate if updates should be allowed.
   */
  shouldUpdate(inputs, state) {
    return true;
  }
  /**
   * Update is called anytime an input to the particle changes.
   *
   * This function can be overwritten to implement the desired
   * behaviour.
   *
   * Inputs are the stores the particle is bound to.
   * State is an object that can be changed and passed to sub-functions.
   * Tools allow the particle to perform supervised activities -
   * for example services are a tool.
   *
   * The update function can return an object containing the new desired
   * value(s) for the stores. For example, if we wanted to update the
   * `Person` and `Address` stores we would return:
   *
   * ```
   * return {
   *   Person: 'Jane Smith',
   *   Address: '123 Main Street'
   * };
   * ```
   *
   * @param inputs
   * @param state
   * @param tools
   *
   * @returns [OPTIONAL] object containing store to value mappings
   */
  async update(inputs, state, tools) {
    return null;
  }
  /**
   * shouldRender returns a boolean that indicates if runtime should
   * render the template.
   *
   * This function can be overwritten to implement the desired
   * behaviour.
   *
   * @param inputs
   * @param state
   *
   * @returns a boolean to indicate if the template should be re-rendered.
   */
  shouldRender(inputs, state) {
    return true;
  }
  /**
   * Render returns an object that contains the key: value pairings
   * that will be interpolated into the {@link template | template}.
   * For example, if the template contained keys `class`,
   * `hideDiv`, and `displayTxt` we could return:
   * ```
   * {
   *   class: 'title`,
   *   hideDiv: false,
   *   displayTxt: "My Page's Title"
   * }
   * ```
   *
   * This functions can be overwritten to return the desired
   * values.
   *
   * @param inputs
   * @param state
   */
  render(inputs, state) {
    return null;
  }
}

const privateProperty = initialValue => {
  let value = initialValue;
  return {get: () => value, set: v => value = v};
};

export class Particle {
  pipe;
  impl;
  internal;
  constructor(proto, pipe, beStateful) {
    this.pipe = pipe;
    this.impl = create(proto);
    defineProperty(this, 'internal', privateProperty(nob()));
    this.internal.$busy = 0;
    //if (beStateful) {
      this.internal.beStateful = true;
      this.internal.state = nob();
    //}
  }
  get log() {
    return this.pipe?.log || log;
  }
  get template() {
    return this.impl?.template;
  }
  get config() {
    return {
      template: this.template
    };
  }
  // set-trap for inputs, so we can do work when inputs change
  set inputs(inputs) {
    //this.log(inputs);
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
    this.invalidate();
  }
  // validate after the next microtask
  invalidate() {
    if (!this.internal.validator) {
      //this.internal.validator = this.async(this.validate);
      this.internal.validator = timeout(this.validate.bind(this), 1);
    }
  }
  // call fn after a microtask boundary
  async(fn) {
    return Promise.resolve().then(fn.bind(this));
  }
  // activate particle lifecycle
  validate() {
    //this.log('validate');
    if (this.internal.validator) {
      // try..finally to ensure we nullify `validator`
      try {
        this.internal.$validateAfterBusy = this.internal.$busy;
        if (!this.internal.$busy) {
          // if we're not stateful
          if (!this.internal.beStateful) {
            // then it's a fresh state every validation
            this.internal.state = nob();
          }
          // inputs are immutable (changes to them are ignored)
          this.internal.inputs = this.validateInputs();
          // let the impl decide what to do
          this.maybeUpdate();
        }
      } finally {
        // nullify validator _after_ methods so state changes don't reschedule validation
        this.internal.validator = null;
      }
    }
  }
  validateInputs() {
    // shallow-clone our input dictionary
    const inputs = assign(nob(), this.inputs);
    // for each input, try to provide prototypical helpers
    entries(inputs).forEach(([key, value]) => {
      if (value && (typeof value === 'object')) {
        if (!Array.isArray(value)) {
          value = setPrototypeOf({...value}, storePrototype);
        }
        inputs[key] = value;
      }
    });
    //return harden(inputs);
    return inputs;
  }
  implements(methodName) {
    return typeof this.impl?.[methodName] === 'function';
  }
  async maybeUpdate() {
    if (await this.checkInit()) {
      if (!this.canUpdate()) {
        // we might want to render even if we don't update,
        // if we `outputData` the system will add render models
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
      if (this.implements('initialize')) {
        await this.asyncMethod(this.impl.initialize);
      }
    }
    return true;
  }
  canUpdate() {
    return this.implements('update');
  }
  async shouldUpdate(inputs, state) {
    //return true;
    // not implementing `shouldUpdate`, means the value should always be true
    // TODO(sjmiles): this violates our 'false by default' convention, but the
    // naming is awkward: `shouldNotUpdate`? `preventUpdate`?
    return !this.impl?.shouldUpdate || (await this.impl.shouldUpdate(inputs, state) !== false);
  }
  update() {
    this.asyncMethod(this.impl?.update);
  }
  outputData(data) {
    this.pipe?.output?.(data, this.maybeRender());
  }
  maybeRender() {
    //this.log('maybeRender');
    if (this.template) {
      const {inputs, state} = this.internal;
      if (this.impl?.shouldRender?.(inputs, state) !== false) {
        //this.log('render');
        if (this.implements('render')) {
          return this.impl.render(inputs, state);
        } else {
          return {...inputs, ...state};
        }
      }
    }
  }
  async handleEvent({handler, data}) {
    const onhandler = this.impl?.[handler];
    if (onhandler) {
      this.internal.inputs.eventlet = data;
      await this.asyncMethod(onhandler.bind(this.impl), {eventlet: data});
      this.internal.inputs.eventlet = null;
    } else {
      //console.log(`[${this.id}] event handler [${handler}] not found`);
    }
  }
  async asyncMethod(asyncMethod, injections?) {
    if (asyncMethod) {
      const {inputs, state} = this.internal;
      const stdlib = {
        service: async request => this.service(request),
        invalidate: () => this.invalidate(),
        output: async data =>  this.outputData(data)
      };
      const task = asyncMethod.bind(this.impl, inputs, state, {...stdlib, ...injections});
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
    } finally {
      this.internal.$busy--;
    }
  }
}

harden(globalThis);
harden(Particle);

// log('Any leaked values? Must pass three tests:');
// try { globalThis['sneaky'] = 42; } catch(x) { log('sneaky test: pass'); }
// try { Particle['foo'] = 42; } catch(x) { log('Particle.foo test: pass'); }
// try { log['foo'] = 42; } catch(x) { log('log.foo test: pass'); };

Particle;
