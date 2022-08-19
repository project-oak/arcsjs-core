/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

// low-level config is first
import './config.js';
// import arcsjs-core dependency
import '../../arcsjs-core.js';
// import arcsjs-support dependency
import {Paths, importModules} from '../../arcsjs-support.js';

// DOM related
export const {
  loadCss,
  Resources,
  XenSurface: Surface
} = await importModules(async path => import(path), [
  '$library/App/resources.js',
  '$library/Dom/dom.js',
  '$library/Dom/container-layout.js',
  '$library/Dom/multi-select.js',
  '$library/Dom/surfaces/xen/xen-surface.js',
  '$library/Dom/material-xen/material-xen.js',
  '$library/Dom/mwc/mwc.min.js',
  '$library/Dom/arcs-elements/arcs-elements.js',
  '$library/Dom/data-explorer/data-explorer.js',
  '$library/Dom/surfaces/xen/surface-walker.js',
  '$library/DevTools/resource-view.js',
  '$library/Media/image-resource.js',
  '$library/NodeGraph/dom/node-graph.js',
  '$library/Dom/geo-location.js',
  '$library/Dom/good-map/good-map.js',
  '$library/nostalgic/Wearable/fliminal/speech-recognizer.js',
  '$library/NodeCatalog/draggable-item.js'
]);
// material icon font
await loadCss(Paths.resolve('$library/Dom/material-icon-font/icons.css'));

// general purpose
export const {
  App,
  themeRules,
  LocalStoragePersistor
} = await importModules(async path => import(path), [
  '$library/App/App.js',
  '$library/App/theme.js',
  '$library/App/storage.js'
]);