/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export { Dictionary } from '../utils/types.js';
export declare type Tag = string;
export declare type StoreMeta = {
    arcid: string;
    name: string;
    type: string;
    owner: string;
    tags?: Tag[];
    value?: any;
    shareid?: string;
};
export declare type ParticleMeta = {
    kind: string;
    container: string;
    staticInputs?: any;
    inputs?: Array</*String|*/ Object>;
    outputs?: Array</*String|*/ Object>;
};
export declare type ArcMeta = {};
