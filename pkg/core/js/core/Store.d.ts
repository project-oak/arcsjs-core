/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { EventEmitter } from './EventEmitter.js';
import { Tag, StoreMeta } from './types.js';
export declare class DataStore extends EventEmitter {
    private privateData;
    constructor();
    protected setPrivateData(data: any): void;
    set data(data: any);
    get data(): any;
    toString(): string;
    get isObject(): boolean;
    get pojo(): any;
    get json(): string;
    set json(json: string);
    get pretty(): string;
}
declare class ObservableStore extends DataStore {
    protected change(mutator: any): void;
    protected doChange(): void;
    onChange(store: any): void;
    set data(data: any);
    get data(): any;
    set(key: string, value: any): void;
    delete(key: string): void;
}
declare class PersistableStore extends ObservableStore {
    meta: Partial<StoreMeta>;
    persistor: any;
    protected willPersist: any;
    constructor(meta: StoreMeta);
    toString(): string;
    get tags(): Tag[];
    is(...tags: Tag[]): boolean;
    isCollection(): boolean;
    doChange(): Promise<void>;
    persist(): Promise<void>;
    restore(value: any): Promise<void>;
    delete(): void;
    save(): string;
    load(serial: string, defaultValue: any): void;
}
export declare class Store extends PersistableStore {
}
export {};
