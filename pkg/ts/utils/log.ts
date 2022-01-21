/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const _logFactory = (enable, preamble, color, log = 'log') => {
  if (!enable) {
    return () => {};
  }
  if (log === 'dir') {
    return console.dir.bind(console);
  }
  const style = `background: ${color || 'gray'}; color: white; padding: 1px 6px 2px 7px; border-radius: 6px 0 0 6px;`;
  return console[log].bind(console, `%c${preamble}`, style);
};

const logKinds =  ['log', 'group', 'groupCollapsed', 'groupEnd', 'dir'];
const errKinds =  ['warn', 'error'];

export const logFactory = (enable, preamble: string, color: string = '') => {
  const loggers = {};
  logKinds.forEach(log => loggers[log] = _logFactory(enable, `${preamble}`, color, log));
  errKinds.forEach(log => loggers[log] = _logFactory(true, `${preamble}`, color, log));
  // `log` is default
  const log = loggers['log'];
  // other loggers invoked by name
  Object.assign(log, loggers);
  return log;
};

logFactory.flags = globalThis['logFlags'] || {};
