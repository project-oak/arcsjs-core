/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Paths} from '../arcsjs-support.js';

// discover library path
const library = Paths.resolve(`$library`);
const dom = Paths.resolve(`$library/Dom`);
const local = '../Library';

// import CSS loader
const {loadCss} = await import(`${dom}/dom.js`);

// scoping hack
export const {Resources} = await import(`${library}/App/resources.js`);
globalThis.resources = Resources;

// common surface implementation
export const {XenSurface: Surface} = await import(`${dom}/surfaces/xen/xen-surface.js`);

// material icon font
await loadCss(`${dom}/material-icon-font/icons.css`);
// Material Web Components
await import(`${dom}/mwc/mwc.min.js`);
await import(`${dom}/material-xen/material-xen.js`);

// mostly used in DevTools
await import(`${dom}/arcs-elements/arcs-elements.js`);
await import(`${dom}/surfaces/xen/surface-walker.js`);
await import(`${library}/DevTools/resource-view.js`);

// bespoke
await import(`${library}/Dom/container-layout.js`);
await import(`${library}/NodeGraph/dom/node-graph.js`);
await import(`${library}/Media/image-resource.js`);
