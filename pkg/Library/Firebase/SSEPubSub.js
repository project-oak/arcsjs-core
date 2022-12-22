/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
const defaultUrl = 'https://arcsjs-core.firebaseio.com';

export const SSEPubSub = class {
  constructor(url, channel) {
    this.subs = [];
    if (!channel) {
      channel = (new URL(document.URL)).searchParams.get('id') ?? 'open';
    }
    this.url = `${url || defaultUrl}/${channel}`;
    console.warn(`using "${channel}" channel`);
  }
  publish(path, value) {
    //console.log(`(pub) ${url}${path}`);
    return fetch(`${this.url}${path}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(value)
    });
  }
  subscribe(path, signal) {
    if (!this.source) {
      this.source = new EventSource(`${this.url}/.json`, {
        //withCredentials: true
      });
      this.source.addEventListener('put', e => this.onPut(e.data));
      this.source.addEventListener('patch', e => this.onPatch(e.data));
    }
    this.subs.push({path, signal});
  }
  onPut(json) {
    try {
      const put = JSON.parse(json);
      //console.log('(put)', put);
      this.notify(put);
    } catch(x) {
    }
  }
  onPatch(json) {
    try {
      const patch = JSON.parse(json);
      //console.log('(patch)', patch);
      this.notify(patch);
    } catch(x) {
    }
  }
  notify(change) {
    this.subs.forEach(({path, signal}) => {
      if (path === change.path) {
        //console.log('signalling');
        signal(change.data);
      }
    });
  }
  debounce(setter, value, ms = 50) {
    const debounce = this.debounce;
    debounce.value = value;
    const commit = () => {
      debounce.timer = false;
      setter(debounce.value);
    };
    if (!debounce.timer) {
      debounce.timer = true;
      setTimeout(commit, ms);
    };
  }
};