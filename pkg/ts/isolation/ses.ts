/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {Paths} from '../utils/paths.js';
import {logFactory} from '../utils/log.js';
import {Runtime} from '../Runtime.js';
import {requireParticleBaseCode, requireParticleImplCode, pathForKind} from './code.js';
import '../../third_party/ses/ses.umd.min.js';

const requiredLog = logFactory(true, 'SES', 'goldenrod');
const log = logFactory(logFactory.flags.ses, 'SES', 'goldenrod');

const {lockdown, Compartment} = globalThis as unknown as {lockdown, Compartment};

let particleCompartment;

export const initSes = (options?) => {
  if (!particleCompartment) {
    const debugOptions = {consoleTaming: 'unsafe', errorTaming: 'unsafe', errorTrapping: 'report', stackFiltering: 'verbose'};
    const prodOptions = {};
    requiredLog.log('LOCKDOWN');
    requiredLog.groupCollapsed('...removing intrinics...');
    lockdown(debugOptions || prodOptions);
    requiredLog.groupEnd();
    particleCompartment = new Compartment({log, resolve, html, makeKey, timeout, ...options?.injections, harden: globalThis.harden});
  }
};

const resolve = Paths.resolve.bind(Paths);
const html = (strings, ...values) => `${strings[0]}${values.map((v, i) => `${v}${strings[i + 1]}`).join('')}`.trim();
const makeKey = () => `i${Math.floor((1 + Math.random() * 9) * 1e14)}`;
const timeout =  async (func, delayMs) => new Promise(resolve => setTimeout(() => resolve(func()), delayMs));

export const createSesParticleFactory = async (kind, options?) => {
  // ensure our Particle runner exists in the isolation chamber
  const Particle = await requireParticle();
  // evaluate custom code in isolation chamber
  const implFactory = await requireImplFactory(kind, options);
  // injections
  const log = createLogger(kind);
  const injections = {log, resolve, html, ...options?.injections};
  // construct 3P prototype
  const proto = implFactory(injections);
  // construct particleFactory
  const particleFactory = (host) => {
    const pipe = {
      log,
      output: host.output.bind(host),
      service: host.service.bind(host)
    };
    return new Particle(proto, pipe);
  };
  return particleFactory;
};

const requireImplFactory = async (kind, options) => {
  // snatch up the custom particle code
  const implCode = await requireParticleImplCode(kind, options);
  let factory;
  try {
    // evaluate in compartment
    factory = particleCompartment.evaluate(implCode);
  } catch(x) {
    log.error('failed to evaluate:', implCode);
    throw x;
  }
  // if it's an object
  if (typeof factory === 'object') {
    // repackage the code to eliminate closures
    factory = repackageImplFactory(factory, kind);
    log('repackaged factory:\n', factory);
  }
  return globalThis.harden(factory);
};

const repackageImplFactory = (factory, kind) => {
  const {constNames, rewriteConsts, funcNames, rewriteFuncs} = collectDecls(factory);
  const proto = `{${[...constNames, ...funcNames]}}`;
  const moduleRewrite = `
({log, ...utils}) => {
// protect utils
harden(utils);
// these are just handy
const {assign, keys, entries, values, create} = Object;
// declarations
${[...rewriteConsts, ...rewriteFuncs].join('\n\n')}
// hardened Object (map) of declarations,
// suitable to be a prototype
return harden(${proto});
// name the file for debuggers
//# sourceURL=sandbox/${pathForKind(kind).split('/').pop()}
};
  `;
  log('rewritten:\n\n', moduleRewrite);
  return particleCompartment.evaluate(moduleRewrite);
};

const collectDecls = factory => {
  // dictionary to 2-tuples
  const props = Object.entries(factory);
  // filter by typeof
  const isFunc = ([n, p]) => typeof p === 'function';
  // get props that are functions
  const funcs = props.filter(isFunc);
  // rewrite object declarations as module declarations
  const rewriteFuncs = funcs.map(([n, f]) => {
    const code = f.toString();
    const async = code.includes('async');
    const body = code.replace('async ', '').replace('function ', '');
    return `${async ? 'async' : ''} function ${body};`;
  });
  // array up the function names
  const funcNames = funcs.map(([n]) => n);
  // if it's not a Function, it's a const
  const consts = props.filter(item => !isFunc(item));
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

let privateCtor;

const requireParticle = async () => {
  if (!privateCtor) {
    const baseCode = await requireParticleBaseCode();
    privateCtor = particleCompartment.evaluate(baseCode);
  }
  return privateCtor;
};

const createLogger = kind => {
  const _log = logFactory(logFactory.flags.particles, kind, 'crimson');
  return (msg, ...args) => {
    const stack = msg?.stack?.split('\n')?.slice(1, 2) || (new Error()).stack.split('\n').slice(2, 3);
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
Runtime.particleIndustry = createSesParticleFactory;
Runtime.securityLockdown = initSes;
