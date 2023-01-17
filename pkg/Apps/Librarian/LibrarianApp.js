/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App} from '../Library/App/Worker/App.js';
import {logFactory, makeName} from '../Library/Core/utils.min.js';
import {DeviceUxRecipe} from '../Library/Media/DeviceUxRecipe.js';
import '../Library/App/surface-imports.js';

const log = logFactory(true, 'LibrarianApp', 'navy');

const LibrarianRecipe = {
  $stores: {
    library: {
      $type: '[Particle]',
      $tags: ['persisted']
    }
  },
  librarian: {
    $kind: '$app/Library/Librarian.js',
    $inputs: ['library'],
    $outputs: ['library']
  }
};

export const LibrarianApp = class extends App {
  constructor(path, root, options) {
    super(path, root, options);
    //this.persistor = LocalStoragePersistor;
    this.services = [];
    this.recipes = [DeviceUxRecipe, LibrarianRecipe];
    log('Librarian lives!');
  }
  // application service
  async onservice(runtime, host, {msg, data}) {
    switch (msg) {
      case 'makeName':
        return makeName();
      case 'addEditor':
        return this.addEditor(runtime, host, data);
      case 'addParticle':
        return this.addParticle(runtime, host, data);
    }
  }
  async addEditor(runtime, host, props) {
    this.arcs.createParticle('editor', 'user', makeEditorParticleMeta(props));
    return true;
  }
  async addParticle(runtime, host, props) {
    const name = makeName();
    const code = packageParticleSource(props);
    const meta = {
      ...this.getMeta(props),
      kind: name,
      container: 'librarian#canvas'
    };
    log(meta);
    this.arcs.createParticle(name, 'user', meta, code);
    return true;
  }
  getMeta(props) {
    try {
      const userMeta = JSON.parse(`{${props.meta}}`);
      return (typeof userMeta === 'object') ? {...userMeta} : null;
    } catch(x) {
      // warn user somehow
    }
    return null;
  }
};

const makeEditorParticleMeta = props => ({
  kind: '$app/Library/Editor.js',
  container: 'librarian#editors',
  staticInputs: {
    name: props?.name ?? makeName(),
    particle: {
      code: props?.code ?? '',
      html: props?.html ?? ''
    }
  },
  inputs: [{library: 'library'}],
  outputs: [{library: 'library'}]
});

const packageParticleSource = props =>
`({
  ${props?.code ? `${props?.code},
  ` : ''}${props?.html ? `template: html\`
  ${props?.html}
  \`` : ''}});
`;
