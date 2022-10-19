/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import * as core from '../Core/core.js';
import {deepEqual} from '../Core/utils.js';
import * as packager from './packager.js';
import '../../dependencies/ses/ses.umd.min.js';

const {logFactory} = core;

const requiredLog = logFactory(true, 'SES', 'goldenrod');
const log = logFactory('isolation', 'SES', 'goldenrod');

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

const {lockdown, Compartment} = globalThis;
let particleCompartment;

export const initSes = (options) => {
  if (!particleCompartment) {
    const debugOptions =
    // null;
    {
      consoleTaming: 'unsafe',
      errorTaming: 'unsafe',
      errorTrapping: 'unsafe',
      stackFiltering: 'concise'
    };
    const prodOptions = {
      consoleTaming: 'safe',
      errorTaming: 'safe',
      errorTrapping: 'safe',
      stackFiltering: 'concise'
    };
    requiredLog.groupCollapsed('LOCKDOWN');
    try {
      lockdown(debugOptions || prodOptions);
      // TODO(sjmiles): become part of the Compartment scope
      // allong with options?.injections (for `initSes(options)`)
      const utils = {log, resolve, html, makeKey, timeout};
      harden(utils);
      harden(options?.injections);
      particleCompartment = new Compartment({
        // default injections
        ...utils,
        // app injections
        ...options?.injections,
        // security injection
        harden: globalThis.harden
      });
      requiredLog.log('Particle Compartment ready');
    }
    finally {
      requiredLog.groupEnd();
    }
  }
};

const resolve = Paths.resolve.bind(Paths);
const html = (strings, ...values) => `${strings[0]}${values.map((v, i) => `${v}${strings[i + 1]}`).join('')}`.trim();
const makeKey = () => `i${Math.floor((1 + Math.random() * 9) * 1e14)}`;
const timeout = async (func, delayMs) => new Promise(resolve => setTimeout(() => resolve(func()), delayMs));

export const particleIndustry = async (kind, options) => {
  // snatch up the custom particle code
  const implCode = await core.code.requireParticleImplCode(kind, options);
  // evaluate custom code in isolation chamber
  const implFactory = await requireImplFactory(kind, implCode);
  // injections
  const log = createLogger(kind);
  const injections = {
    log, SafeObject,
    ...options?.injections
  };
  harden(injections);
  // construct 3P prototype
  const proto = implFactory(injections);
  // ensure our Particle constructor exists in the isolation chamber
  const Particle = await requireParticle();
  // construct particleFactory
  const particleFactory = host => {
    // TODO(sjmiles): maybe pipe = { ...host?.pipe?.(), log};
    const pipe = {
      log,
      output: host?.output?.bind?.(host),
      service: host?.service?.bind?.(host)
    };
    return new Particle(proto, pipe);
  };
  return particleFactory;
};

const requireImplFactory = async (kind, implCode) => {
  let proto;
  try {
    // evaluate in compartment
    proto = particleCompartment.evaluate(implCode);
  }
  catch (x) {
    log.error('failed to evaluate:', implCode);
    throw x;
  }
  // if it's an object
  if (typeof proto === 'object') {
    // repackage the code to eliminate closures
    const module = packager.packageProtoFactory(proto, kind);
    const factory = particleCompartment.evaluate(module);
    log.groupCollapsed(`repackaged factory for [${kind}]`);
    log(factory);
    log.groupEnd();
    return globalThis.harden(factory);
  }
};

let privateCtor;

const requireParticle = async () => {
  if (!privateCtor) {
    const baseCode = await core.code.requireParticleBaseCode();
    privateCtor = particleCompartment.evaluate(baseCode);
  }
  return privateCtor;
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
// Runtime.particleIndustry = createSesParticleFactory;
// Runtime.securityLockdown = initSes;
