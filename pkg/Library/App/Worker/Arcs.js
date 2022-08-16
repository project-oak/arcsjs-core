/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {MessageBus} from './MessageBus.js';
import {XenComposer as Composer} from '../../Dom/Surfaces/Default/XenComposer.js';

// n.b. lives in 'top' context

// composer handles render packets
let composer;
// socket will be our MessageBus
let socket;

// monostate
const watchers = {};
const getters = {};
const arcs = {};

// n.b. vibrational paths are worker-relative

const receiveVibrations = msg => {
  if (msg.type === 'render') {
    // channel vibrations to the local composer
    composer.render(msg.packet);
  } else if (msg.type === 'service') {
    // channel vibrations to the arcs service
    arcs.service(msg);
  } else if (msg.type === 'store') {
    // channel vibrations to the store getter
    getters[msg.storeKey]?.(msg.data);
    // channel vibrations to the store watchers
    watchers[msg.storeKey]?.(msg.data);
  }
};

// service call from Arcs engine
arcs.service = async msg => {
  const data = await arcs.onservice?.(msg);
  socket.sendVibration({kind: 'serviceResult', sid: msg.sid, data});
};

// install data watcher
arcs.watch = (arc, storeKey, handler) => {
  watchers[storeKey] = handler;
  arcs.addWatch(arc, storeKey);
};

// get handler
arcs.get = async (arc, storeKey) => {
  return new Promise(resolve => {
    getters[storeKey] = data => {
      getters[storeKey] = null;
      resolve(data);
    };
    socket.sendVibration({kind: 'getStoreData', arc, storeKey});
  });
};

arcs.init = ({root, paths, onservice}) => {
  // make a composer suitable for rendering on our document
  composer = new Composer(root, true);
  // worker path is document relative
  const worker = new Worker(paths.$arcs, {type: 'module', name: 'arcsjs'});
  // bus to worker
  socket = new MessageBus(worker);
  // listen to worker
  socket.receiveVibrations(receiveVibrations);
  // channel local events into vibrations
  composer.onevent = (pid, eventlet) => {
    socket.sendVibration({kind: 'handleEvent', pid, eventlet});
  };
  // memoize important paths
  arcs.addPaths(paths);
  // connect app-supplied conduits
  arcs.onservice = onservice;
};

// public API
arcs.addPaths         = (paths)                   => socket.sendVibration({kind: 'addPaths', paths});
arcs.createParticle   = (name, arc, meta, code)   => socket.sendVibration({kind: 'createParticle', name, arc, meta, code});
arcs.setInputs        = (arc, particle, inputs)   => socket.sendVibration({kind: 'setInputs', arc, particle, inputs});
arcs.addRecipe        = (recipe, arc)             => socket.sendVibration({kind: 'addRecipe', recipe, arc});
arcs.addAssembly      = (recipes, arc)            => socket.sendVibration({kind: 'addAssembly', recipes, arc});
arcs.set              = (arc, storeKey, data)     => socket.sendVibration({kind: 'setStoreData', arc, storeKey, data});
arcs.addWatch         = (arc, storeKey)           => socket.sendVibration({kind: 'watch', arc, storeKey});
arcs.setOpaqueData    = (key, data)               => socket.sendVibration({kind: 'setOpaqueData', key, data});

export {arcs as Arcs};
