/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Store } from '../core/Store.js';
export declare class AutomergeStore extends Store {
    crdt: any;
    constructor(meta: any);
    get data(): any;
    set data(data: any);
    private initDefaultStateDoc;
    get pojo(): any;
    protected change(mutator: any): void;
    setCrdt(crdt: any): void;
    save(): string;
    load(data: any): void;
}
