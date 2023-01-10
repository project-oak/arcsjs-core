/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {GraphApp } from '../../../Library/App/Graph/GraphApp.js';
import {logFactory, LocalStoragePersistor} from '../conf/arcs.js';
import {dbNodeTypes, dbGraph} from './DbRecipe.js';

const log = logFactory(true, 'Db', 'navy');

// App class
export const DbApp = class extends GraphApp {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.services = {};
    this.nodeTypes = dbNodeTypes;
    this.graph = dbGraph;
    log('Welcome!');
  }
  // application service
  // async onservice(runtime, host, {msg, data}) {
  //   switch (msg) {
  //     case 'hello': {
  //       return 'world';
  //     }
  //   }
  // }
};
