/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {Runtime, Arc, Chef, Paths} from '../../Core/core.js';
import {Xen} from '../../Dom/Xen/xen-async.js';
import {XenComposer} from '../../Dom/Surfaces/Default/XenComposer.js';
import {NodeTypes} from '../../GraphsNodes/NodeTypes.js';
import {JSONataService} from '../../JSONata/JSONataService.js';
import {initVanilla} from '../../Isolation/vanilla.js';
import {RecipeBuilder} from '../RecipeBuilder.js';
import '../../Dom/common.js';

// set up isolation
initVanilla();

export class Graphinator extends Xen.Async {
  static get observedAttributes() {
    return ['graph', 'paths'];
  }
  _didMount() {
    this.setup();
  }
  setup() {
    this.user = new Runtime('user');
    const createArc = n => this.user.addArc(new Arc(n));
    this.arc = createArc('arc');
    this.arc.service = async (host, request) =>{
      console.log(host, request);
      const result = JSONataService.evaluate(null, host, request);
      console.log(result);
      return result;
    };
    this.arc.composer = new XenComposer(this, true);
  }
  update({graph, paths}, state) {
    if (paths) {
      Paths.add(paths);
    }
    if (graph) {
      this.updateGraph(graph);
    }
  }
  async updateGraph(graph) {
    RecipeBuilder.defaultContainer = '';
    const recipes = RecipeBuilder.construct({graph, nodeTypes: NodeTypes});
    console.groupCollapsed('recipes');
    console.log(JSON.stringify(recipes, null, '  '));
    console.groupEnd();
    await Chef.executeAll(recipes, this.user, this.arc);
    console.log(this.user);
  }
  get template() {
    return Xen.Template.html`<slot></slot>`;
  }
}

customElements.define('graph-inator', Graphinator);
