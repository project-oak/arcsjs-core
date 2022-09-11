/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {Paths} from '../utils/paths.js';
import {Runtime} from '../Runtime.js';
import {logFactory} from '../utils/log.js';
import {deepEqual} from '../utils/object.js';
import {requireParticleImplCode, pathForKind} from './code.js';

const log = logFactory(logFactory.flags.isolation, 'vanilla', 'goldenrod');

const harden = object => object;

globalThis.harden = harden;
globalThis.scope = {
  harden
};

const makeKey = () => `i${Math.floor((1 + Math.random() * 9) * 1e14)}`;
const timeout =  async (func, delayMs) => new Promise(resolve => setTimeout(() => resolve(func()), delayMs));

export const initVanilla = (options?) => {
  // requiredLog.groupCollapsed('LOCKDOWN');
  try {
    log(deepEqual);
    const utils = {log, resolve, html, makeKey, deepEqual, timeout};
    const scope = {
      // default injections
      ...utils,
      // app injections
      ...options?.injections,
    };
    Object.assign(globalThis.scope, scope);
    Object.assign(globalThis, scope);
  } finally {
    /**/
  }
};

const resolve = Paths.resolve.bind(Paths);
const html = (strings, ...values) => `${strings[0]}${values.map((v, i) => `${v}${strings[i + 1]}`).join('')}`.trim();

const createParticleFactory = async (kind, options?) => {
  // ensure our canonical Particle class exists in the isolation chamber
  const {Particle} = await import('../core/Particle.js');
  //const Particle = await requireParticle();
  // // evaluate custom code in isolation chamber
  const implFactory = await requireImplFactory(kind, options);
  // injections
  const log = createLogger(kind);
  const injections = {log, resolve, html, ...options?.injections};
  // construct 3P prototype
  const proto = implFactory(injections);
  // // construct particleFactory
  const particleFactory = (host) => {
    const pipe = {
      log,
      output: host.output.bind(host),
      service: host.service.bind(host)
    };
    return new Particle(proto, pipe, true);
  };
  return particleFactory;
};

const requireImplFactory = async (kind, options) => {
  // snatch up the custom particle code
  const implCode = await requireParticleImplCode(kind, options);
  let factory = (0, eval)(implCode);
  // if it's an object
  if (typeof factory === 'object') {
    // repackage the code to eliminate closures
    factory = repackageImplFactory(factory, kind);
    log('repackaged factory:\n', factory);
  }
  return globalThis.harden(factory);
};

const {assign, keys, entries, values, create} = Object;

globalThis.SafeObject = {
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
  }
};

const repackageImplFactory = (factory, kind) => {
  const {constNames, rewriteConsts, funcNames, rewriteFuncs} = collectDecls(factory);
  const proto = `{${[...constNames, ...funcNames]}}`;
  const moduleRewrite = `
({log, ...utils}) => {
// protect utils
globalThis.harden(utils);
// these are just handy
const {assign, keys, entries, values, create, mapBy} = globalThis.SafeObject;
// declarations
${[...rewriteConsts, ...rewriteFuncs].join('\n\n')}
// hardened Object (map) of declarations,
// suitable to be a prototype
return globalThis.harden(${proto});
// name the file for debuggers
//# sourceURL=sandbox/${pathForKind(kind).split('/').pop()}
};
  `;
  log('rewritten:\n\n', moduleRewrite);
  return (0, eval)(moduleRewrite);
};

const collectDecls = factory => {
  // dictionary to 2-tuples
  const props = Object.entries(factory);
  // filter by typeof
  const isFunc = ([n, p]) => typeof p === 'function';
  // filter out forbidden names
  const isForbidden = ([n, p]) => n == 'harden' || n == 'globalThis';
  // get props that are functions
  const funcs = props.filter(item => isFunc(item) && !isForbidden(item));
  // rewrite object declarations as module declarations
  const rewriteFuncs = funcs.map(([n, f]) => {
    const code = (f as Object)?.toString?.() ?? '';
    const async = code.includes('async');
    const body = code.replace('async ', '').replace('function ', '');
    return `${async ? 'async' : ''} function ${body};`;
  });
  // array up the function names
  const funcNames = funcs.map(([n]) => n);
  // if it's not a Function, it's a const
  const consts = props.filter(item => !isFunc(item) && !isForbidden(item));
  // build const decls
  const rewriteConsts = consts.map(([n, p]) => {
    return `const ${n} = \`${p}\`;`;
  });
  // array up the const names
  const constNames = consts.map(([n]) => n);
  return {
    constNames,
    rewriteConsts,
    funcNames,
    rewriteFuncs
  };
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
        .replace(/at (.*) (\d)/, 'at "$1" $2')
      )
      .reverse()
      .join('\n')
      .trim()
    ;
    if (msg?.message) {
      _log.error(msg.message, ...args, `(${where})`);
    } else {
      _log(msg, ...args, `(${where})`);
    }
  };
};

// give the runtime a safe way to instantiate Particles
Runtime.particleIndustry = createParticleFactory;
Runtime.securityLockdown = initVanilla;
