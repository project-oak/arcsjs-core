/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export declare const requireParticleBaseCode: {
    (sourcePath?: any): Promise<any>;
    source: any;
};
export declare const requireParticleImplCode: (kind: any, options?: any) => Promise<any>;
export declare const fetchParticleCode: (kind?: any) => Promise<string>;
export declare const maybeFetchParticleCode: (kind: any) => Promise<string>;
export declare const pathForKind: (kind?: any) => string;
