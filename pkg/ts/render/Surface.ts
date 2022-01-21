/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {logFactory} from '../utils/log.js';
import {Composer} from './Composer.js';

const log = logFactory(logFactory.flags.composer, 'surface', 'tomato');

export class Surface {
  activeComposer: Composer;
  activate() {
  }
  deactivate() {
  }
  async createComposer(id): Promise<Composer> {
    const composer = await this.createComposerInstance(id);
    composer.listen('activate', () => this.composerActivated(composer));
    return composer;
  }
  protected async createComposerInstance(id) {
    return new Composer();
  }
  protected composerActivated(composer) {
    this.activeComposer = composer;
  }
  // TODO(sjmiles): can we just use this and skip the event stuff?
  activateComposer(composer) {
    this.activate();
    this.composerActivated(composer);
  }
};
