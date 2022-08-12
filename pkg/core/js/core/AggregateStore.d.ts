/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { StoreMeta } from './types.js';
import { Store } from './Store.js';
import { Runtime } from '../Runtime.js';
export declare class AggregateStore extends Store {
    criteria: Partial<StoreMeta>;
    stores: Store[];
    protected debounceKey: any;
    constructor(meta: StoreMeta);
    nameFromTags(): string;
    onContextAdd(store: any): void;
    onContextChanged(store: any): void;
    addMapped(stores: any): void;
    protected pushStores(stores: any): void;
    protected invalidateStore(): void;
    protected aggregateStores(): Promise<void>;
    save(): string;
    hasStore(store: any): boolean;
    marshal(runtime: Runtime): void;
    rebuild(runtime: Runtime): void;
}
