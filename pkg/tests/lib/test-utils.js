/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {deepEqualVisitor} from './test-compare.js';
import {log, sysLog, errLog} from './logger.js';

// #workbench for surfaces
const {workbench} = window;

const {keys, assign, entries} = Object;

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

// MVP test runner
export const runTests = async tests => {
  let pass = true;
  sysLog(`<pre style="font-size: 0.7em; font-family: monospace;">${pretty(globalThis.config)}</pre>`);
  for (const [name, test] of entries(tests)) {
    // remove old DOM
    workbench.innerText = '';
    //console.clear();
    // run test
    const result = await test();
    // process results
    sysLog(`<test-name>${name.replace(/_/g, ' ')}</test-name>`);
    if (result.pass) {
      log('PASS');
    } else {
      pass = false;
      errLog('ERROR');
      log(`expected: `, result.expected);
      sysLog('received: ', result.value);
    }
  }
  return pass;
};

export const waitFor = async ms => new Promise(resolve => setTimeout(resolve, ms));

export const kill = globalThis.kill = () => {
  const {App} = globalThis;
  if (App) {
    App.dispose?.();
    App.user = null;
    App.system = null;
    console.log('::killed app environment');
  }
};

export const checkState = (actualState, expectedState) => {
  const actual = typeof actualState === 'string' ? JSON.parse(actualState) : actualState;
  const actualJson = typeof actualState === 'string' ? actualState : JSON.stringify(actualState);
  const expected = typeof expectedState === 'string' ? JSON.parse(expectedState) : expectedState;
  const expectedJson = typeof expectedState === 'string' ? expectedState : JSON.stringify(expectedState);
  return new Promise(resolve => {
    const pass = compareState(actual, expected);
    if (!pass) {
      logDiff(actualJson, expectedJson);
    }
    resolve({pass, expected: expectedJson, value: actualJson});
    kill();
  });
};

export const compareState = (actualState, expectedState) => {
  return deepEqualVisitor(
    actualState, expectedState,
    (a, b, key) => {
      if (key === 'canvas') {
        return true;
      }
    }
  );
};

const logDiff = (actualState, expectedState) => {
  let diff = '';
  let [state0, state1] = (actualState.length > expectedState.length) ? [actualState, expectedState] : [expectedState, actualState];
  state0.split('').forEach((c, i) => diff += (c != state1.charAt(i)) ? '_' : c);
  console.warn(diff);
};

export const stateCapture = (stores, omitKeys) => {
  const data = (stores ? keys(stores) : []).reduce((data, key) => {
    const omit = omitKeys?.includes?.(key);
    if (!omit) {
      //console.warn(key);
      const {meta, data: value} = stores[key];
      data[key] = {meta, value};
    }
    return data;
  }, {});
  //console.warn('state', data);
  return json(data);
};