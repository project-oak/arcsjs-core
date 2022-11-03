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
import {DbRecipe} from './DbRecipe.js';
import {logFactory} from '../../Library/Core/utils.min.js';

const log = logFactory(true, 'Db', 'navy');

// App class
export const DbApp = class extends App {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.services = {};
    this.userAssembly = [DbRecipe];
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