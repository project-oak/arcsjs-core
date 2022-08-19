/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export declare type Dictionary<T> = Partial<Record<string, T>>;
export declare type LoggerFunction = (...args: any[]) => void;
export declare const logKinds: readonly ["log", "group", "groupCollapsed", "groupEnd", "dir"];
export declare const errKinds: readonly ["warn", "error"];
export declare type DebugLoggers = Record<typeof logKinds[number], LoggerFunction>;
export declare type ErrorLoggers = Record<typeof errKinds[number], LoggerFunction>;
export declare type AllLoggerFunctions = DebugLoggers & ErrorLoggers;
export declare type Logger = LoggerFunction & AllLoggerFunctions;
