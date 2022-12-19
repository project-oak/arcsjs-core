/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {code} from '../Core/core.js';

export const packageProtoFactory = (factoryProto, kind) => {
  const {funcs, consts} = collectDecls(factoryProto);
  const factoryRewrite = `
({log, SafeObject: {assign, keys, entries, values, create, map, mapBy, deepEqual}, ...etc}) => ({


${[funcs.join(',\n\n'), consts.join(',\n')].filter(n => n).join(',\n')}


});
//# sourceURL=sandbox/${code.pathForKind(kind).split('/').pop()}
`;
  packageProtoFactory.lastRewrite = factoryRewrite;
  //  console.groupCollapsed('rewritten: ', kind);
  //  console.log(factoryRewrite);
  //  console.groupEnd();
  return factoryRewrite;
};

const collectDecls = proto => {
  // forbidden identifiers
  const forbidden = []; //'harden', 'globalThis'];
  // forbidden identifier filter
  const isForbidden = ([n, p]) => forbidden.includes(n);
  // function filter
  const isFunc = ([n, p]) => typeof p === 'function';
  // dictionary to 2-tuples
  const props = Object.entries(proto);
  // get allowed props that are functions
  const funcs = props.filter(item => !isForbidden(item) && isFunc(item));
  // rewrite object declarations as module declarations
  const rewrittenFuncs = rewriteFuncs(funcs);
  //
  // if it's not a Function, it's a const
  const consts = props.filter(item => !isForbidden(item) && !isFunc(item));
  // build const decls
  const rewrittenConsts = rewriteConsts(consts);
  //
  return {
    funcs: rewrittenFuncs,
    consts: rewrittenConsts
  };
};

const rewriteFuncs = funcs => funcs.map(([n, f]) => {
  let func = String(f);
  // ios/Safari
  if (func.startsWith('function ')) {
    func = func.slice(9);
  } else if (func.startsWith('async function ')) {
    func = `async ${func.slice(15)}`;
  }
  //log(func);
  return func;
});

const rewriteConsts = consts => consts.map(([n, p]) => {
  return `${n}: ${typeof p === 'string' ? `\`${p}\`` : p}`;
});
