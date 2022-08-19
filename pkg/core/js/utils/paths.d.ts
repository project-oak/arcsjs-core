/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export declare const PathMapper: {
    new (root: string): {
        map: Record<string, unknown>;
        add(mappings: any): void;
        resolve(path: any): string;
        setRoot(root: any): void;
        getAbsoluteHereUrl(meta: any, depth: any): any;
    };
};
export declare const Paths: {
    map: Record<string, unknown>;
    add(mappings: any): void;
    resolve(path: any): string;
    setRoot(root: any): void;
    getAbsoluteHereUrl(meta: any, depth: any): any;
};
