/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {App} from '../../Library/App/Worker/App.js';
import {LocalStoragePersistor} from '../../Library/LocalStorage/LocalStoragePersistor.js';
// import {HistoryService} from '../../Library/App/HistoryService.js';
// import {MediaService} from '../../Library/NewMedia/MediaService.js';
// import {GoogleApisService} from '../../Library/Goog/GoogleApisService.js';
// import {FaceMeshService} from '../../Library/Mediapipe/FaceMeshService.js';
// import {SelfieSegmentationService} from '../../Library/Mediapipe/SelfieSegmentationService.js';
// import {ThreejsService} from '../../Library/Threejs/ThreejsService.js';
// import {TensorFlowService} from '../../Library/TensorFlow/TensorFlowService.js';
// import {CocoSsdService} from '../../Library/TensorFlow/CocoSsdService.js';
// import {ShaderService} from '../../Library/Shader/ShaderService.js';
import {GraphsRecipe} from './GraphsRecipe.js';
import {logFactory} from '../../Library/Core/utils.min.js';

const log = logFactory(true, 'Graphs', 'navy');

// App class
export const GraphsApp = class extends App {
  constructor(paths) {
    super(paths);
    this.persistor = new LocalStoragePersistor('user');
    this.services = {
      // HistoryService,
      // MediaService,
      // ThreejsService,
      // ShaderService,
      // FaceMeshService,
      // SelfieSegmentationService,
      // TensorFlowService,
      // CocoSsdService,
      // GoogleApisService
    };
    this.recipes = [GraphsRecipe];
    log('Welcome!');
  }
  // application service
  async onservice(runtime, host, {msg, data}) {
    switch (msg) {
      case 'MakeGraph': {
        if (data.input === 'How many is 5 plus 8?') {
          return binaryOpGraph;
        }
        return oneGraph;
      }
      case 'RunGraph': {
        if (data.graph) {
          const graph = toPipeline(data.graph);
          // if (graph) {
          //   console.log(`GRAPH TO PIPELINE: ${JSON.stringify(graph)}`);
          // }
          return {
            status: 'Success!',
            details: `Dummy response for:`,
            nodes: Object.keys(graph.nodes).join(', '),
            answer: Object.keys(graph.nodes).length === 1 ? '13' : 'DOOOOGGGG!!!'
          };
        }
      }
      return {status: 'no graph'};
    }
  }
};

// globalThis.graph = {
const binaryOpGraph = {
  "BinaryOp1": {
    "type": "Binary Op",
    "displayName": "Binary Op",
    "props": {
      "operand1": 5,
      "operand2": 8,
      "operator": "add"
    }
  }
};

const oneGraph = {
  "Image1": {
    "type": "Image",
    "displayName": "Image",
    "props": {
      "image": {
        "url": "dog.jpg"
      }
    }
  },
  "MobilenetNode1": {
    "type": "MobilenetNode",
    "displayName": "Mobilenet",
    "connections": {
      "Image": ["Image1:image"]
    }
  },
  "BarDisplayNode1": {
    "type": "BarDisplayNode",
    "displayName": "Bar Display",
    "connections": {
      "ClassifierResults": ["MobilenetNode1:ClassifierResults"]
    }
  }
};

const toPipeline = (graph) => {
  // convert 'Graph' to 'Pipeline'
  const nodes = {};
  const graph = {
    $meta: {
      id: "dynamic",
      name: 'Dynamic'
    },
    nodes
  };
  Object.entries(graph).forEach(([name, value]) => {
    const node = {...value, id: name};
    const connections = {};
    if (node.connections) {
      Object.entries(node.connections).forEach(([name, connects]) => {
        connections[name] = connects.map(conn => {
          const [from, storeName] = conn.split(':');
          return {from, storeName};
        });
      });
    }
    node.connections = connections;
    nodes[name] = node;
  });
  return graph;
  // app.arcs.set('user', 'selectedGraph', graph)
};
