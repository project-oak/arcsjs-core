/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Paths} from '../utils/paths.js';
import {logFactory} from '../utils/log.js';
import {Runtime} from '../Runtime.js';
import {requireParticleBaseCode, requireParticleImplCode, pathForKind} from './code.js';
import '../../third_party/ses/ses.umd.min.js';
import {Generator} from '../../third_party/inlinesourcemap/inline-source-map.js';

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
  // ensure our Particle runner is in the isolation chamber
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
  // dictionary to array 2-tuples
  const props = Object.entries(factory);
  // filter by typeof
  const isFunc = ([n, p]) => typeof p === 'function';
  // get props that are functions
  const funcs = props.filter(isFunc);
  // rewrite object declarations as module delcarations
  const rewriteFuncs = funcs.map(([n, f]) => {
    const code = f.toString();
    const async = code.includes('async');
    const body = code.replace('async ', '').replace('function ', '');
    return `${async ? 'async' : ''} function ${body};`;
  });
  // const rewriteFuncs = funcs.map(([n, f]) => {
  //   const sync = n.includes('render');
  //   const code = f.toString();
  //   const body = sync ? code : code.replace(/async/, '');
  //   return `${sync ? '' : 'async'} function ${body};`;
  // });
  const funcMembers = funcs.map(([n]) => n);
  //
  const consts = props.filter(item => !isFunc(item));
  const rewriteConsts = consts.map(([n, p]) => {
    return `const ${n} = \`${p}\`;`;
  });
  const constMembers = consts.map(([n]) => n);
  //
  const proto = `{${[...constMembers, ...funcMembers]}}`;
  //
  const rewrite = `
({log, ...utils}) => {

harden(utils);
const {assign, keys, entries, values, create} = Object;

${[...rewriteConsts, ...rewriteFuncs].join('\n\n')}

return harden(${proto});

};
  `;
  // Since it is too problematic to adjust for comments and whitespace
  // stripped by the JS parser by traversing an object and calling toString()
  // Here we just add the generated rewritten particle as-is to the sourcemap
  // It will appear in DevTools and allow debugging, but won't match what's on
  // disk.
  var gen = new Generator({ charset: 'utf-8' })
      .addSourceContent(pathForKind(kind), rewrite)
      .addGeneratedMappings(pathForKind(kind), rewrite, { line: 0, column: 0 });

  const inlineSourceMap = gen.inlineMappingUrl();
  const rewriteWithSourceMap = rewrite + inlineSourceMap + "\n";
  log('rewritten:\n\n', rewriteWithSourceMap);
  return particleCompartment.evaluate(rewriteWithSourceMap);
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
