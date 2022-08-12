/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Runtime } from '../Runtime.js';
import { Arc } from '../core/Arc.js';
import { StoreMeta, StoreSpec } from './types.js';
export declare type StoreMapFunc = (runtime: Runtime, arc: Arc, store: any) => void;
export declare class StoreCook {
    static execute(runtime: Runtime, arc: Arc, stores: StoreMeta[]): Promise<any[]>;
    static evacipate(runtime: Runtime, arc: Arc, stores: StoreMeta[]): Promise<any[]>;
    static forEachStore(task: StoreMapFunc, runtime: Runtime, arc: Arc, stores: StoreMeta[]): Promise<any[]>;
    static realizeStore(runtime: Runtime, arc: Arc, rawMeta: StoreMeta): Promise<void>;
    static derealizeStore(runtime: Runtime, arc: Arc, spec: StoreSpec): Promise<void>;
    static constructMeta(runtime: Runtime, arc: Arc, rawMeta: StoreMeta): StoreMeta;
}
