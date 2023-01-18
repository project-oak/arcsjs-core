/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {MessageBus} from './MessageBus.js';
import {logFactory} from '../../Core/utils.min.js';
import {XenComposer as Composer} from '../../Dom/Surfaces/Default/XenComposer.js';

// n.b. lives in 'top' context

const log = logFactory(logFactory.flags.arcs, 'Arcs', 'goldenrod', '#333');

// socket will be our MessageBus
let socket;

// monostate
const watchers = {};
const getters = {};
const arcs = {};

arcs.blargTheWorker = async ({paths}) => {
  const code = [
    `import '${paths.$config}';`,
    `import '${paths.$library}/App/Worker/ArcsWorker.js';`
  ];
  const text = code.join('\n');
  const blob = new Blob([text], {type: 'application/javascript'});
  const oUrl = URL.createObjectURL(blob);
  const worker = new Worker(oUrl, {type: 'module', name: 'arcsjs'});
  setTimeout(() => URL.revokeObjectURL(oUrl), 5000);
  log.groupCollapsed('Worker launched (blarg!)');
  log.log(text);
  log.groupEnd();
  return worker;
};

// n.b. vibrational paths are worker-relative

const receiveVibrations = msg => {
  if (msg.type === 'render') {
    // channel vibrations to the local composer
    renderPacket(msg.packet);
  } else if (msg.type === 'service') {
    // channel vibrations to the arcs service
    handleServiceCall(msg);
  } else if (msg.type === 'store') {
    // channel vibrations to the store getter
    getters[msg.storeKey]?.(msg.data);
    // channel vibrations to the store watchers
    watchers[msg.storeKey]?.(msg.data);
  }
};

// render packet from Arcs engine
const renderPacket = packet =>  {
  arcs.onrender?.(packet);
};

// service call from Arcs engine
const handleServiceCall = async msg => {
  // async `onservice` handler was provided by user
  const data = await arcs.onservice?.(msg);
  // when it's done, send the answer vibration back
  socket.sendVibration({kind: 'serviceResult', sid: msg.sid, data});
};

const createComposer = async root => {
  if (root) {
    // make a composer suitable for rendering on our document
    const composer = new Composer(root, true);
    // channel local events into vibrations
    composer.onevent = (pid, eventlet) => {
      socket.sendVibration({kind: 'handleEvent', pid, eventlet});
    };
    socket.sendVibration({kind: 'rerender'});
    return composer
  }
};

// public API

arcs.init = async ({paths, onrender, onservice, injections}) => {
  log.log(paths, injections);
  // worker path is document relative
  const worker = await arcs.blargTheWorker({paths});
  // bus to worker
  socket = new MessageBus(worker);
  // listen to worker
  socket.receiveVibrations(receiveVibrations);
  // connect app-supplied conduits
  arcs.onrender = onrender;
  arcs.onservice = onservice;
  // memoize paths
  arcs.addPaths(paths);
  // initialize particle scope
  socket.sendVibration({kind: 'setInjections', injections});
  // initiate security procedures
  socket.sendVibration({kind: 'secureWorker'});
};

// install data watcher
arcs.watch = (arc, storeKey, handler) => {
  watchers[storeKey] = handler;
  socket.sendVibration({kind: 'watch', arc, storeKey});
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

arcs.createComposer = root => {
  return createComposer(root);
};

// arcs.setComposerRoot = root => {
//   if (root) {
//     // make a composer suitable for rendering on our document
//     composer = createComposer(root);
//   }
// };

arcs.addPaths         = (paths)                   => socket.sendVibration({kind: 'addPaths', paths});
arcs.createArc        = (arc)                     => socket.sendVibration({kind: 'createArc', arc});
arcs.createParticle   = (name, arc, meta, code)   => socket.sendVibration({kind: 'createParticle', name, arc, meta, code});
arcs.destroyParticle  = (name, arc)               => socket.sendVibration({kind: 'destroyParticle', name, arc});
arcs.updateParticle   = (particle, code, arc)     => socket.sendVibration({kind: 'updateParticle', particle, code, arc});
arcs.setInputs        = (arc, particle, inputs)   => socket.sendVibration({kind: 'setInputs', arc, particle, inputs});
// arcs.addRecipe        = (arc, recipe)             => socket.sendVibration({kind: 'addRecipe', recipe, arc});
// arcs.addRecipes       = (arc, recipes)            => socket.sendVibration({kind: 'addRecipes', recipes, arc});
// arcs.removeRecipe     = (arc, recipe)             => socket.sendVibration({kind: 'removeRecipe', recipe, arc});
// arcs.removeRecipes    = (arc, recipes)            => socket.sendVibration({kind: 'removeRecipes', recipes, arc});
arcs.runGraph  = (arc, graph, nodeTypes, layoutInfo) => socket.sendVibration({kind: 'runGraph', arc, graph, nodeTypes, layoutInfo});
arcs.removeGraph      = (arc, graph, nodeTypes)   => socket.sendVibration({kind: 'removeGraph', arc, graph, nodeTypes});
arcs.set              = (arc, storeKey, data)     => socket.sendVibration({kind: 'setStoreData', arc, storeKey, data});
arcs.setOpaqueData    = (key, data)               => socket.sendVibration({kind: 'setOpaqueData', key, data});

export {arcs as Arcs};
