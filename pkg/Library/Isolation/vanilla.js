/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import * as core from '../Core/core.js';
import * as packager from './packager.js';

const {logFactory, Paths} = core;
const log = logFactory('isolation', 'vanilla', 'goldenrod');

const makeKey = () => `i${Math.floor((1 + Math.random() * 9) * 1e14)}`;
const timeout = async (func, delayMs) => new Promise(resolve => setTimeout(() => resolve(func()), delayMs));
const {deepEqual} = core.utils;

const {assign, keys, entries, values, create} = Object;
const SafeObject = {
  create,
  assign,
  keys(o) {
    return o ? keys(o) : [];
  },
  values(o) {
    return o ? values(o) : [];
  },
  entries(o) {
    return o ? entries(o) : [];
  },
  mapBy(a, keyGetter) {
    return a ? values(a).reduce((map, item) => (map[keyGetter(item)] = item, map), {}) : {};
  },
  deepEqual
};

export const initVanilla = options => {
  // requiredLog.groupCollapsed('(NO) LOCKDOWN');
  try {
    // TODO(sjmiles): become part of the Compartment scope
    // along with options?.injections (for `initSes(options)`)
    // TODO(sjmiles): globalThis as Compartment is really
    // unpleasant, we can probably use a Worker instead
    const utils = {log, resolve, html, makeKey, deepEqual, timeout};
    const scope = {
      // default injections
      ...utils,
      // app injections
      ...options?.injections,
    };
    //Object.assign(globalThis.scope, scope);
    Object.assign(globalThis, scope);
  }
  finally {
    //
  }
};

const resolve = Paths.resolve.bind(Paths);
const html = (strings, ...values) => `${strings[0]}${values.map((v, i) => `${v}${strings[i + 1]}`).join('')}`.trim();

export const particleIndustry = async (kind, options) => {
  // snatch up the custom particle code
  const implCode = await core.code.requireParticleImplCode(kind, options);
  // evaluate custom code in isolation chamber
  const implFactory = await requireImplFactory(kind, implCode);
  // injections
  const log = createLogger(kind);
  const injections = {log, resolve, html, ...options?.injections, SafeObject};
  // construct 3P prototype
  const proto = implFactory(injections);
  // ensure our Particle constructor exists,
  // we need it for the isolation chamber
  const {Particle} = await import('../Core/core/Particle.js');
  // construct particleFactory
  const particleFactory = (host) => {
    const pipe = {
      log,
      output: host?.output?.bind(host),
      service: host?.service?.bind(host)
    };
    return new Particle(proto, pipe, true);
  };
  return particleFactory;
};

const requireImplFactory = async (kind, implCode) => {
  let proto;
  try {
    // evaluate
    proto = (0, eval)(implCode);
  }
  catch (x) {
    log.error('failed to evaluate:', implCode);
    throw x;
  }
  // if it's an object
  if (typeof proto === 'object') {
    // repackage the code to eliminate closures
    const module = packager.packageProtoFactory(proto, kind);
    const factory = (0, eval)(module);
    log.groupCollapsed(`repackaged factory for [${kind}]`);
    log(factory);
    log.groupEnd();
    return factory;
  }
};

const createLogger = kind => {
  const _log = logFactory(logFactory.flags.particles, kind, '#002266');
  return (msg, ...args) => {
    const stack = msg?.stack?.split('\n')?.slice(1, 2) || (new Error()).stack?.split('\n').slice(2, 3);
    const where = stack
      .map(entry => entry
      .replace(/\([^()]*?\)/, '')
      .replace(/ \([^()]*?\)/, '')
      .replace('<anonymous>, <anonymous>', '')
      .replace('Object.', '')
      .replace('eval at :', '')
      .replace(/\(|\)/g, '')
      .replace(/\[[^\]]*?\] /, '')
      .replace(/at (.*) (\d)/, 'at "$1" $2'))
      .reverse()
      .join('\n')
      .trim();
    if (msg?.message) {
      _log.error(msg.message, ...args, `(${where})`);
    }
    else {
      _log(msg, ...args, `(${where})`);
    }
  };
};

// give the runtime a safe way to instantiate Particles
core.Runtime.particleIndustry = particleIndustry;
core.Runtime.securityLockdown = initVanilla;
