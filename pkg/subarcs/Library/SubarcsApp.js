/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import '../conf/config.js';
import '../../Library/App/surface-imports.js';
import {logFactory, makeName} from '../../Library/Core/utils.min.js';
import {DeviceUxRecipe} from '../../Library/Media/DeviceUxRecipe.js';
import {LocalStoragePersistor} from '../../Library/LocalStorage/LocalStoragePersistor.js';
import {App} from '../../Library/App/Worker/App.js';

const log = logFactory(true, 'SubarcsApp', 'navy', 'silver');

const SubarcsRecipe = {
  $stores: {
    library: {
      $type: '[Particle]',
      $tags: ['persisted']
    }
  },
  garfunkel: {
    $kind: '$app/Library/Garfunkel.js'
  },
  subarcs: {
    $kind: '$app/Library/Subarcs.js',
    $inputs: ['library'],
    $outputs: ['library']
  }
};

const OtherRecipe = {
  garfunkel2: {
    $container: '#garfunkel',
    $kind: '$app/Library/Garfunkel.js'
  }
};

export const SubarcsApp = class extends App {
  constructor(path, root, options) {
    super(path, root, options);
    this.root = window.arc0;
    this.persistor = new LocalStoragePersistor('user');
    this.services = [];
    this.userAssembly = [DeviceUxRecipe, SubarcsRecipe];
    log('Subarcs lives!');
  }
  async spinup() {
    await super.spinup();
    await this.arcs.addAssembly([OtherRecipe], 'NewArc');
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
    //this.arcs.createParticle('editor', 'user', makeEditorParticleMeta(props));
    return true;
  }
  async addParticle(runtime, host, props) {
    // const name = makeName();
    // const code = packageParticleSource(props);
    // const meta = {
    //   ...this.getMeta(props),
    //   kind: name,
    //   container: 'librarian#canvas'
    // };
    // log(meta);
    // this.arcs.createParticle(name, 'user', meta, code);
    // return true;
  }
  // getMeta(props) {
  //   try {
  //     const userMeta = JSON.parse(`{${props.meta}}`);
  //     return (typeof userMeta === 'object') ? {...userMeta} : null;
  //   } catch(x) {
  //     // warn user somehow
  //   }
  //   return null;
  // }
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
