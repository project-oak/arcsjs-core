/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
/**
 * Perform `action` if `delay` ms have elapsed since last debounce call for `key`.
 *
 * ```
 * // invoke 'task' one second after last time this line executed
 * this.debounceTask = debounce(this.debounceTask, task, 1000);
 * ```
 */
export const debounce = (key, action, delay) => {
    if (key) {
        clearTimeout(key);
    }
    if (action && delay) {
        return setTimeout(action, delay);
    }
};
export const async = task => {
    return async (...args) => {
        await Promise.resolve();
        task(...args);
    };
};
export const asyncTask = (task, delayMs) => {
    setTimeout(task, delayMs ?? 0);
};
