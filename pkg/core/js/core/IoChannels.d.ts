/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Store } from './Store.js';
export declare const InputChannel: {
    new (): {};
    computeInputs(stores: Store[], meta: any): any;
    computeInput(stores: any, [name, binding]: [any, any], inputs: any): void;
};
export declare const OutputChannel: {
    new (): {};
    assignOutputs(stores: any, { id, meta }: {
        id: any;
        meta: any;
    }, outputs: any): void;
    assignOutput(stores: any, name: any, output: any, outputs: any): void;
    findOutputByName(outputs: any, name: any): any;
};
