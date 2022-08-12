/**
* @license
* Copyright (c) 2022 Google LLC All rights reserved.
* Use of this source code is governed by a BSD-style
* license that can be found in the LICENSE file.
*/
import {MessageBus} from './MessageBus.js';
// self-contained XenComposer
import {XenComposer as Composer} from '../../Dom/Surfaces/Default/XenComposer.js';

// make an arcs API object
const arcs = {};

// n.b. vibrational paths are worker-relative

// make a composer suitable for rendering on our document
let composer, socket;

// channel vibrations to the local composer
const receiveVibrations = msg => {
  if (msg.type === 'render') {
    composer.render(msg.packet);
  }
  else if (msg.type === 'service') {
    socket.onservice?.(msg);
  }
};

arcs.init = (root, path) => {
  // make a composer suitable for rendering on our document
  composer = new Composer(root, true);
  // worker path is document relative
  const worker = new Worker(path, {type: 'module', name: 'arcsjs'});
  // bus to worker
  socket = new MessageBus(worker);
  // listen to worker
  socket.receiveVibrations(receiveVibrations);
  // channel local events into vibrations
  composer.onevent = (pid, eventlet) => {
    socket.sendVibration({kind: 'handleEvent', pid, eventlet});
  };
};

// public API
arcs.addPaths         = (paths)                   => socket.sendVibration({kind: 'addPaths', paths});
arcs.createParticle   = (name, arc, meta)         => socket.sendVibration({kind: 'createParticle', name, arc, meta});
arcs.setInputs        = (arc, particle, inputs)   => socket.sendVibration({kind: 'setInputs', arc, particle, inputs});
arcs.addRecipe        = (recipe, arc)             => socket.sendVibration({kind: 'addRecipe', recipe, arc});
arcs.addAssembly      = (recipes, arc)            => socket.sendVibration({kind: 'addAssembly', recipes, arc});
arcs.set              = (arc, storeKey, data)     => socket.sendVibration({kind: 'setStoreData', arc, storeKey, data});
arcs.get              = (arc, storeKey)           => socket.sendVibration({kind: 'getStoreData', arc, storeKey});
export {arcs as Arcs};
