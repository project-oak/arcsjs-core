/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
// requires #logbook node
const {logbook} = window;

const {assign} = Object;

export const json = obj => JSON.stringify(obj);
export const pretty = obj => JSON.stringify(obj, null, '  ');
export const dom = (name, props) => assign(document.createElement(name), props);

const entry = (cursor, attr) => {
  const node = cursor.appendChild(dom('entry'));
  if (attr) {
    node.setAttribute(attr, '');
  }
  return node;
};

const logCursor = (cursor, attr) => (...args) => assign(entry(cursor, attr), {innerHTML: args.join('')});

export const log = logCursor(logbook, 'console');
export const sysLog = logCursor(logbook, 'system');
export const errLog = logCursor(logbook, 'error');