/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
// it's important everybody use the same core, using this indirection
// we bottleneck the import target (e.g. .min.js or .js)
//export * from './arcs.min.js';
export * from './arcs.js';