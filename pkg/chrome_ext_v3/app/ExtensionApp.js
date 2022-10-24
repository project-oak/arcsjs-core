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
import {HistoryService} from '../deploy/Library/App/HistoryService.js';
import {FirebaseStoragePersistor} from '../deploy/Library/Firebase/FirebaseStoragePersistor.js';
// import {LocalStoragePersistor} from '../deploy/Library/LocalStorage/LocalStoragePersistor.js';
// import {ChromeStoragePersistor} from '../deploy/Library/Chrome/ChromeStoragePersistor.js';
//import {NodegraphRecipe} from '../deploy/nodegraph/Library/NodegraphRecipe.js';

const log = logFactory(true, 'ExtensionApp', 'navy');

const ExtensionRecipe = {
  $stores: {
    html: {
      $tags: ['persisted'],
      $type: 'MultilineString',
//       $value: `
// <div style="padding: 24px;">
//   <h3>Hello World ${Math.random()}</h3>
// </div>
//         `.trim(),
    }
  },
  echo: {
    $kind: '$library/Echo.js',
    $inputs: ['html']
  }
};

export const ExtensionApp = class extends App {
  constructor(path, root, options) {
    super(path, root, options);
    this.services = {
      HistoryService
    };
    this.persistor = new FirebaseStoragePersistor('user');
    this.userAssembly = [ExtensionRecipe];
    this.composer = new XenComposer(document.body, true);
    this.composer.onevent = (p, e) => this.handle(p, e);
    this.arcs.render = p => this.render(p);
    log('Extension lives!');
  }
  async spinup() {
    await super.spinup();
//     this.arcs.set('user', 'html', `
// <div style="padding: 24px;">
//   <h3>Hello World ${Math.random()}</h3>
// </div>
//     `);
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
