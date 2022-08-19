/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Runtime } from '../Runtime.js';
export declare class AutomergeNetwork {
    log: any;
    log2: any;
    nid: any;
    runtime: Runtime;
    shares: Record<string, unknown>;
    constructor(nid: any, runtime: any);
    connectEndpoint(): void;
    shareStore(storeId: any, peerId: any): void;
    invalidatePeers(storeId: any): void;
    private initShare;
    private updatePeer;
    private send;
    private receive;
    private updateCrdt;
    private updatePeers;
}
