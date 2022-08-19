/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { EventEmitter } from './EventEmitter.js';
import { Host } from './Host.js';
import { Dictionary, ArcMeta } from './types.js';
import { Store } from './Store.js';
export declare class Arc extends EventEmitter {
    log: any;
    id: any;
    meta: ArcMeta;
    stores: Store[];
    hosts: Dictionary<Host>;
    surface: any;
    composer: any;
    hostService: any;
    constructor(id: any, meta: ArcMeta, surface: any);
    addHost(host: Host, surface?: any): Promise<Host>;
    ensureComposer(): Promise<void>;
    removeHost(id: any): void;
    addStore(storeId: any, store: any): void;
    removeStore(storeId: any): void;
    protected storeChanged(storeId: any, store: any): void;
    updateParticleMeta(hostId: any, meta: any): void;
    updateHost(host: any): void;
    protected computeInputs(host: any): any;
    protected computeInput([name, binding]: [any, any], inputs: any): void;
    assignOutputs({ id, meta }: {
        id: any;
        meta: any;
    }, outputs: any): void;
    protected assignOutput(name: any, output: any, outputs: any): void;
    findOutputByName(outputs: any, name: any): any;
    render(packet: any): Promise<void>;
    onevent(pid: any, eventlet: any): void;
    service(host: any, request: any): Promise<any>;
}
