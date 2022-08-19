/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export declare class EventEmitter {
    protected listeners: {};
    protected getEventListeners(eventName: any): any;
    protected fire(eventName: any, ...args: any[]): void;
    listen(eventName: any, listener: any, listenerName?: any): any;
    unlisten(eventName: any, listener: any): void;
}
