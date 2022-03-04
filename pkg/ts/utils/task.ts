/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

type Task = (...args: any[]) => void;
type DebounceKey = number;

/**
 * Perform `action` if `delay` ms have elapsed since last debounce call for `key`.
 *
 * ```
 * // invoke 'task' one second after last time this line executed
 * this.debounceTask = debounce(this.debounceTask, task, 1000);
 * ```
 */
export const debounce = (key: DebounceKey, action: Task, delay: number): DebounceKey => {
  if (key) {
    clearTimeout(key);
  }
  if (action && delay) {
    return setTimeout(action, delay) as unknown as number;
  }
};

export const async = task => {
  return async (...args) => {
    await Promise.resolve();
    task(...args);
  };
};

export const asyncTask = (task, delayMs?) => {
  setTimeout(task, delayMs ?? 0);
};
