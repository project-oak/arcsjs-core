/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { logFactory } from '../utils/log.js';
import { Composer } from './Composer.js';
const log = logFactory(logFactory.flags.composer, 'surface', 'tomato');
export class Surface {
    // activeComposer: Composer;
    // activate() {
    // }
    // deactivate() {
    // }
    async createComposer(id) {
        const composer = await this.createComposerInstance(id);
        // composer.listen('activate', () => this.composerActivated(composer));
        return composer;
    }
    async createComposerInstance(id) {
        return new Composer();
    }
    async service(msg) {
    }
}
