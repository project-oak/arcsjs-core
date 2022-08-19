/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export declare type Task = (...args: any[]) => void;
declare type DebounceKey = number;
/**
 * Perform `action` if `delay` ms have elapsed since last debounce call for `key`.
 *
 * ```
 * // invoke 'task' one second after last time this line executed
 * this.debounceTask = debounce(this.debounceTask, task, 1000);
 * ```
 */
export declare const debounce: (key: DebounceKey, action: Task, delay: number) => DebounceKey;
export declare const async: (task: any) => (...args: any[]) => Promise<void>;
export declare const asyncTask: (task: any, delayMs?: any) => void;
export {};
