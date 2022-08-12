/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Logger } from './types.js';
export declare const logFactory: {
    (enable: boolean, preamble: string, color?: string): Logger;
    flags: any;
};
