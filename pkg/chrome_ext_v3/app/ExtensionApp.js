/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App} from '../deploy/Library/App/TopLevel/App.js';
import {logFactory} from '../deploy/Library/Core/utils.min.js';
import {XenComposer} from '../deploy/Library/Dom/Surfaces/Default/XenComposer.js';
import {NodegraphRecipe} from '../deploy/nodegraph/Library/NodegraphRecipe.js';

const log = logFactory(true, 'ExtensionApp', 'navy');

const ExtensionRecipe = {
  echo: {
    $kind: '$library/Echo.js',
    $staticInputs: {html: 'World'}
  }
};

const LibrarianRecipe = {
  $stores: {
    library: {
      $type: '[Particle]',
      $tags: ['persisted']
    }
  },
  librarian: {
    $kind: './deploy/librarian/Library/Librarian.js',
    $inputs: ['library'],
    $outputs: ['library']
  }
};

export const ExtensionApp = class extends App {
  constructor(path, root, options) {
    super(path, root, options);
    this.services = [];
    this.userAssembly = [NodegraphRecipe];
    //this.userAssembly = [ExtensionRecipe, LibrarianRecipe];
    this.composer = new XenComposer(document.body, true);
    this.composer.onevent = (p, e) => this.handle(p, e);
    this.arcs.render = p => this.render(p);
    log('Extension lives!');
  }
  render(packet) {
    //log('render', packet);
    this.composer.render(packet);
  }
  handle(pid, eventlet) {
    // TODO(sjmiles): the composer doesn't know from Arcs or Users, so the PID is all we have
    // we should make the PID into an USERID:ARCID:PARTICLEID ... UAPID? UAP? E[vent]ID?
    const arc = Object.values(this.arcs.user.arcs).find(({hosts}) => hosts[pid]);
    arc?.onevent(pid, eventlet);
  }
};
