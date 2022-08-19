/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { EventEmitter } from '../core/EventEmitter.js';
import { Slot } from '../recipe/types.js';
export interface RenderPacket {
    id: any;
    container: any;
    content: {
        template: any;
        model: any;
        $clear: any;
    };
}
export interface ComposerInterface {
    render(packet: RenderPacket): any;
    onevent(pid: any, eventlet: any): any;
}
export declare class Composer extends EventEmitter {
    protected slots: any;
    protected pendingPackets: any;
    constructor();
    activate(): void;
    processPendingPackets(): void;
    render(packet: RenderPacket): void;
    clearSlot(slot: any): void;
    findContainer(container: any): any;
    generateSlot(id: any, template: any, parent: any): Slot;
    maybeReattachSlot(slot: any, container: any): void;
    onevent(pid: any, eventlet: any): void;
    requestFontFamily(fontFamily: any): boolean;
}
