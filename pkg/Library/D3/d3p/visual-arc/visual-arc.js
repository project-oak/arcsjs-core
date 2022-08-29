/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {Parser} from '../../../core.js';
import {Xen} from '../../../Dom/Xen/xen-async.js';
import {renderForceGraph, renderTreeGraph} from './d3-render.js';
//import {TfjsRecipe} from '../../../../../tfjs/Library/TfjsRecipe.js';
// import {VivinoAction} from '../../../../Actions/DefaultActions.js';
// import {OpenFoodFactsAction} from '../../../../Actions/DefaultActions.js';

const recipes = [
  // ...VivinoAction.recipes,
  // ...OpenFoodFactsAction.recipes
];

const template = Xen.Template.html`
<style>
  :host {
    display: flex;
  }
  * {
    box-sizing: border-box;
  }
  [flexcols] {
    display: flex;
    overflow: hidden;
  }
  [flexrows] {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  [flexee] {
    flex: 1;
    border: 1px solid orange;
  }
  [flex2] {
    flex: 2;
  }
  [flex3] {
    flex: 3;
  }
  #panel0 > svg, #panel1 > svg {
    flex: 1;
  }
</style>

<div flexee flexrows>
  <div flexe3 flexrows id="panel0"></div>
  <div flexee flex2 flexrows id="panel1"></div>
</div>
`;

const GROUP = {
  ARC: 0,
  PARTICLE: 1,
  STORE: 2,
  SLOT: 3
};

// convert array to dictionary, using key-field `key`
const tupleate = (items, key) => items.reduce((dict, value) => Object.assign(dict, {[value[key]]: value}), {});

export class VisualArc extends Xen.Async {
  static get observedAttributes() {
    return [];
  }
  get template() {
    return template;
  }
  _didMount() {
    this.state = {
      panel0: this._dom.$('#panel0'),
      panel1: this._dom.$('#panel1')
    };
  }
  update({stopped}, state) {
    if (!state.parsed) {
      state.parsed = true;
      this.generateGraphs(state);
    }
  }
  render({}, {}) {
    return {
    };
  }
  async generateGraphs({panel0, panel1}) {
    const parsed = await this.parse();
    //
    panel0.innerText = '';
    panel0.appendChild(await this.generateStoreParticleGraph(parsed));
    //
    panel1.innerText = '';
    panel1.appendChild(await this.generateSlotParticleTree(parsed));
  }
  async parse() {
    const parser = new Parser();
    recipes.forEach(r => parser.parse(r));
    // TODO(sjmiles): make a Planner and ask it what the actions are
    //const names = Object.keys(Planner.marshalArActions(recipes));
    //await Promise.all(names.map(name => parser.parse(recipes[name])));
    // await parser.parse(recipes.ARWineAction);
    // await parser.parse(recipes.ARFoodAction);
    // await parser.parse(recipes.ARReweAction);
    return parser;
  }
  generateStoreParticleGraph(parsed) {
    // generate a set of links or edges
    const links = [];
    // convert array to dictionary
    //const stores_ = tupleate(parsed.stores, `name`);
    //const stores = Object.values(stores_).map(s => ({...s, id: s.name, group: GROUP.STORE}));
    const stores = parsed.stores.map(s => ({...s, id: s.name, group: GROUP.STORE}));
    //stores.forEach(s => links.push({source: s.id, target: 'Arc'}));
    //console.log(stores);
    //
    //const particles_ = tupleate(parsed.particles.filter(p => p.spec?.$bindings), 'id');
    //const particles = Object.values(particles_).map(p => {
    //
    // for each particle with bindings
    const particles = parsed.particles.filter(p => p.spec?.$inputs || p.spec?.$outputs).map(p => {
      // for each binding
      [...(p.spec?.$inputs || []), ...(p.spec?.$outputs || [])].forEach(
        // add a link between this particle and the target store
        ([key, value]) => links.push({source: p.id, target: value || key, strength: 0.0001}
      ));
      //const name = /*p.spec?.$kind?.split('/').pop() ||*/ p.id;
      return {...p.spec, group: GROUP.PARTICLE, id: p.id, name: p.id};
    });
    //console.log(particles);
    //
    const nodes = [
      //{id: 'Arc', group: 0},
      ...stores,
      ...particles
    ];
    const scale = 100;
    const width = 4 * scale;
    const height = 3 * scale;
    const node = renderForceGraph({links, nodes}, width, height);
    return node;
    //panel0.appendChild(node);
  }
  async generateSlotParticleTree(parsed) {
    const slots_ = tupleate(parsed.slots, `$name`);
    // const slots_ = parsed.slots.reduce((dict, value) => {
    //   dict[value.$name] = value;
    //   return dict;
    // }, {});
    const slots = Object.values(slots_);
    //console.log(slots);
    //
    // create particle map
    const particleMap = parsed.particles.reduce((dict, value) => {
      dict[value.id] = value;
      return dict;
    }, {});
    // convert map to node records
    const particles = Object.values(particleMap).map(p => ({...p, name: p.id, children: [], group: GROUP.PARTICLE}));
    //console.log(particles);
    //
    const populateParticles = node => {
      particles.filter(p => p.container === node.name/* && p.spec.$slots*/).forEach(p => node.children.push(p));
      node.children.forEach(node => populateSlots(node));
    };
    const populateSlots = node => {
      slots.filter(s => s.$parent === node.name).forEach(s => node.children.push({/*...s,*/ name: s.$name, children: [], group: GROUP.SLOT}));
      node.children.forEach(node => populateParticles(node));
    };
    const root = {
      name: 'root',
      parent: null,
      children: []
    };
    populateParticles(root);
    //console.log(root);
    const scale = 100;
    const width = 4 * scale;
    const height = 3 * scale;
    const node = renderTreeGraph({root}, width, height);
    return node;
  }
}
