/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import './conf/config.js';
import {paths} from './conf/allowlist.js';
import {NodegraphApp} from './Library/NodegraphApp.js';

try {
  const app = globalThis.app = new NodegraphApp(paths);
  await app.spinup();
} catch(x) {
  console.error(x);
}

// globalThis.use = (graph) => {
//   // convert 'Graph' to 'Graph'
//   const nodes = {};
//   const graph = {
//     $meta: {
//       id: "dynamic",
//       name: 'Dynamic'
//     },
//     nodes
//   };
//   Object.entries(graph).forEach(([name, value]) => {
//     const node = {...value, id: name};
//     const connections = {};
//     if (node.connections) {
//       Object.entries(node.connections).forEach(([name, connects]) => {
//         connections[name] = connects.map(conn => {
//           const [from, storeName] = conn.split(':');
//           return {from, storeName};
//         });
//       });
//     }
//     node.connections = connections;
//     nodes[name] = node;
//   });
//   app.arcs.set('user', 'selectedGraph', graph)
// };
//
// globalThis.graph = {
//   "Image1": {
//     "type": "Image",
//     "displayName": "Image",
//     "props": {
//       "image": {
//         "url": "http://localhost:9888/assets/corgi.jpeg"
//       }
//     }
//   },
//   "MobilenetNode1": {
//     "type": "MobilenetNode",
//     "displayName": "Mobilenet",
//     "connections": {
//       "Image": ["Image1:image"]
//     }
//   },
//   "BarDisplayNode1": {
//     "type": "BarDisplayNode",
//     "displayName": "Bar Display",
//     "connections": {
//       "ClassifierResults": ["MobilenetNode1:ClassifierResults"]
//     }
//   }
// };
