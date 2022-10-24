/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
/* global chrome */
import {logFactory} from '../Core/core.js';
import {Persistor} from '../LocalStorage/LocalStoragePersistor.js';

const log = logFactory(logFactory.flags.storage, 'ChromeStoragePersistor', 'limegreen');

export const ChromeStoragePersistor = class extends Persistor {
  upload(key, serial) {
    //debugger;
    log(chrome.tabs);
    log(key);
    postMessage({msg: 'upload', key});
    //chrome.storage.sync.set({[key]: serial});
  }
  async download(key) {
    //debugger;
    log(chrome.tabs);
    log(key);
    postMessage({msg: 'download', key});
    return `"<div style='padding: 24px;'><h3>Hello World ${Math.random()}</h3></div>"`;
    //return new Promise(resolve => chrome.storage.sync.get([key], result => resolve(result)));
  }
};
