/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export declare class Params {
    static prefix: string;
    static update(): void;
    static getParam(name: any): any;
    static hasParam(name: any): boolean;
    static setParam(name: any, value: any): void;
    static setUrlParam(name: any, value: any): void;
    static replaceUrlParam(name: any, value: any): void;
    static setUrlParamQuietly(name: any, value: any): string;
    static qualifyName(name: any): string;
    static fetchValue(name: any): string;
    static storeValue(name: any, value: any): void;
    static fetchJsonValue(name: any): any;
    static storeJsonValue(name: any, value: any): void;
}
