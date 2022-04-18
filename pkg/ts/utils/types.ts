/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export type Dictionary<T> = Partial<Record<string, T>>;

export type LoggerFunction = (...args: any[]) => void;

export const logKinds = ['log', 'group', 'groupCollapsed', 'groupEnd', 'dir'] as const;
export const errKinds = ['warn', 'error'] as const;

export type DebugLoggers = Record<typeof logKinds[number], LoggerFunction>;
export type ErrorLoggers = Record<typeof errKinds[number], LoggerFunction>;
export type AllLoggerFunctions = DebugLoggers & ErrorLoggers;
export type Logger = LoggerFunction & AllLoggerFunctions;

