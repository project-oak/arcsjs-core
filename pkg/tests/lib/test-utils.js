/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {stateCapture} from './stateCapture.js';
import {deepEqualVisitor} from './test-compare.js';

const {assign, entries} = Object;
const {workbench} = window;

export const json = obj => JSON.stringify(obj);
export const pretty = obj => JSON.stringify(obj, null, '  ');
export const dom = (name, props) => assign(document.createElement(name), props);

export const getTestState = async name => {
  const result = await fetch(`https://arcsjs-apps.firebaseio.com/test/specs/${name}.json`);
  const json = await result.json();
  return json || '';
};

export const getTestInjections = async name => {
  const result = await fetch(`https://arcsjs-apps.firebaseio.com/test/injections/${name}.json`);
  const json = await result.json();
  return json || '';
};

// create a logger
const {logbook} = window;
const entry = (cursor, attr) => {
  const node = cursor.appendChild(dom('entry'));
  if (attr) {
    node.setAttribute(attr, '');
  }
  return node;
};
const logCursor = (cursor, attr) => (...args) => assign(entry(cursor, attr), {innerHTML: args.join('')});
export const log = logCursor(logbook, 'console');
export const sysLog = logCursor(logbook, 'system');
export const errLog = logCursor(logbook, 'error');

// MVP test runner
export const runTests = async tests => {
  sysLog(`<pre style="font-size: 0.7em; font-family: monospace;">${pretty(globalThis.config)}</pre>`);
  for (const [name, test] of entries(tests)) {
    // remove old DOM
    workbench.innerText = '';
    //console.clear();
    console.log('.');
    // run test
    const result = await test();
    // process results
    sysLog(`<test-name>${name.replace(/_/g, ' ')}</test-name>`);
    if (result.pass) {
      log('PASS');
    } else {
      errLog('ERROR');
      log(`expected: `, result.expected);
      sysLog('received: ', result.value);
    }
  }
};

export const waitFor = async ms => new Promise(resolve => setTimeout(resolve, ms));

export const kill = globalThis.kill = () => {
  globalThis.App.user = null;
  globalThis.App.system = null;
  //workbench.innerText = '';
  console.log('::killed app environment');
};

export const checkState = expectedState => {
  return new Promise(resolve => {
    const actualState = stateCapture();
    const pass = compareState(actualState, expectedState);
    //const pass = actualState === expectedState;
    if (!pass) {
      let diff = '';
      let [state0, state1] = (actualState.length > expectedState.length) ? [actualState, expectedState] : [expectedState, actualState];
      state0.split('').forEach((c, i) => diff += (c != state1.charAt(i)) ? 'X' : c);
      console.warn(diff);
      console.warn(globalThis.App.user);
    }
    resolve({pass, expected: expectedState, value: actualState});
    kill();
  });
};

export const compareState = (actualState, expectedState) => {
  const ignoreKeys = {'canvas':1, 'url':1};
  const visitor = (a, b, key) => ignoreKeys[key] ? true : undefined;
  return deepEqualVisitor(JSON.parse(actualState), JSON.parse(expectedState), visitor);
};