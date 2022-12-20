/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {NodeCatalogNode} from '../NodeCatalog/NodeCatalogNode.js';
import {NodeInspectorNode} from '../NodeInspector/NodeInspectorNode.js';
import {JSONataNode} from './JSONataNode.js';
// import {DataNode, PersistedDataNode} from './DataNode.js';
import {DisplayNode} from './DisplayNode.js';
import {ImageNode} from './ImageNode.js';
import {CameraNode} from './CameraNode.js';
import {ListenerNode} from './ListenerNode.js';
import {TextFieldNode} from '../Fields/TextFieldNode.js';
import {MultilineTextFieldNode} from '../Fields/MultilineTextFieldNode.js';
import {SelectFieldNode} from '../Fields/SelectFieldNode.js';
import {LibrarianNode} from '../Graphs/LibrarianNode.js';
import {GraphRunnerNode} from '../Graphs/GraphRunnerNode.js';
import {ArcNode} from '../Arc/ArcNode.js';
import {PixiJsDemoNode} from '../PixiJs/PixiJsNodes.js';
import {ImageCompositeNode} from '../NewMedia/Nodes.js';

export const NodeTypes = {
  JSONataNode,
  // DataNode,
  // PersistedDataNode,
  DisplayNode,
  ImageNode,
  CameraNode,
  ListenerNode,
  ImageCompositeNode,
  ArcNode,
  TextFieldNode,
  MultilineTextFieldNode,
  SelectFieldNode,
  LibrarianNode,
  GraphRunnerNode,
  NodeCatalogNode,
  NodeInspectorNode,
  PixiJsDemoNode
};
