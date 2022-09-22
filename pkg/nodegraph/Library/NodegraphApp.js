/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {App} from '../../Library/App/Worker/App.js';
import {LocalStoragePersistor} from '../../Library/LocalStorage/LocalStoragePersistor.js';
import {HistoryService} from '../../Library/App/HistoryService.js';
import {MediaService} from '../../Library/NewMedia/MediaService.js';
import {GoogleApisService} from '../../Library/Goog/GoogleApisService.js';
import {MediapipeService} from '../../Library/Mediapipe/MediapipeService.js';
import {ThreejsService} from '../../Library/Threejs/ThreejsService.js';
import {TensorFlowService} from '../../Library/TensorFlow/TensorFlowService.js';
import {ShaderService} from '../../Library/Shader/ShaderService.js';
import {NodegraphRecipe} from './NodegraphRecipe.js';
import {logFactory} from '../../Library/Core/utils.min.js';

const log = logFactory(true, 'Nodegraph', 'navy');

// App class
export const NodegraphApp = class extends App {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.services = {HistoryService, MediaService, GoogleApisService, ThreejsService, ShaderService, MediapipeService, TensorFlowService};
    this.userAssembly = [NodegraphRecipe];
    log('Welcome!');
  }
//};

// application service
async onservice(runtime, host, {msg, data}) {
  switch (msg) {
    // case 'makeName':
    //   return makeName();
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
  kind: '$app/../librarian/Library/Editor.js',
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
