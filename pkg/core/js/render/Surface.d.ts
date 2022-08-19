/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Composer } from './Composer.js';
export declare class Surface {
    createComposer(id: any): Promise<Composer>;
    protected createComposerInstance(id: any): Promise<Composer>;
    protected service(msg: any): Promise<void>;
}
