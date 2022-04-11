/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {logKinds, errKinds, LoggerFunction, AllLoggerFunctions, DebugLoggers, ErrorLoggers, Logger} from './types.js';

const _logFactory = (enable: boolean, preamble: string, color: string | '', log: keyof AllLoggerFunctions = 'log'): LoggerFunction => {
  if (!enable) {
    return () => {};
  }
  if (log === 'dir') {
    return console.dir.bind(console);
  }
  const style = `background: ${color || 'gray'}; color: white; padding: 1px 6px 2px 7px; border-radius: 6px 0 0 6px;`;
  return console[log].bind(console, `%c${preamble}`, style);
};

export const logFactory = (enable: boolean, preamble: string, color: string = ''): Logger => {
  const loggers: AllLoggerFunctions = {
    ...(Object.fromEntries(logKinds.map(log => [log, _logFactory(enable, `${preamble}`, color, log)])) as DebugLoggers),
    ...(Object.fromEntries(errKinds.map(log => [log, _logFactory(true, `${preamble}`, color, log)])) as ErrorLoggers)
  };
  // Inject `log` as default, keeping all loggers available to be invoked by name.
  const log = loggers.log;
  Object.assign(log, loggers);
  return log as Logger;
};

logFactory.flags = globalThis['logFlags'] || {};
