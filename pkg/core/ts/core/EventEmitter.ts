/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export class EventEmitter {
  // map of event name to listener array
  protected listeners = {};
  protected getEventListeners(eventName) {
    return this.listeners[eventName] || (this.listeners[eventName] = []);
  }
  protected fire(eventName, ...args) {
    const listeners = this.getEventListeners(eventName);
    if (listeners?.forEach) {
      listeners.forEach(listener => listener(...args));
    }
  }
  listen(eventName, listener, listenerName?) {
    const listeners = this.getEventListeners(eventName);
    listeners.push(listener);
    listener._name = listenerName || '(unnamed listener)';
    return listener;
  }
  unlisten(eventName, listener) {
    const list = this.getEventListeners(eventName);
    const index = (typeof listener === 'string') ? list.findIndex(l => l._name === listener) : list.indexOf(listener);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      console.warn('failed to unlisten from', eventName);
    }
  }
}
