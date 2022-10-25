/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
/* global chrome */
import {logFactory} from '../Core/core.js';
import {Persistor} from '../LocalStorage/LocalStoragePersistor.js';

const log = logFactory(logFactory.flags.storage, 'FirebaseStoragePersistor', 'limegreen');

const url = `https://arcsjs-core-default-rtdb.firebaseio.com`;

const putJson = async (url, data) => {
  return fetch(url, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
};

const getJson = async url => {
  const res = await fetch(url);
  return res.json();
};

export const FirebaseStoragePersistor = class extends Persistor {
  upload(key, serial) {
    log(key, serial);
    putJson(`${url}/${key}.json`, serial);
    //putJson(`${url}/scott.json`, serial);
  }
  async download(key) {
    log(key);
    return getJson(`${url}/${key}.json`);
    // log(await getJson(`${url}/${key}.json`));
    // return `"<div style='padding: 24px;'><h3>Hello World ${Math.random()}</h3></div>"`;
  }
};
