/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export declare const shallowUpdate: (obj: any, data: any) => any;
export declare const shallowMerge: (obj: any, data: any) => any;
export declare function deepCopy<T>(datum: T): T;
export declare const deepEqual: (a: any, b: any) => any;
export declare const deepUndefinedToNull: (obj: any) => any;
