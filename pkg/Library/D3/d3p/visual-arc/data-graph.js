/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

 import {Parser} from '../../../core.js';
 import {Xen} from '../../../Dom/Xen/xen-async.js';
import {d3} from '../../d3.js';
import {renderForceGraph} from './d3-render.js';

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
    flex-direction: column;
    overflow: hidden;
  }
  * {
    box-sizing: border-box;
  }
  [flex], svg {
    flex: 1;
  }
</style>
`;

const GROUP = {
  ARC: 0,
  PARTICLE: 1,
  STORE: 2,
  SLOT: 3
};

const {entries} = Object;

// convert array to dictionary, using key-field `key`
// [{[key], ...}, ...] => {key: {...}, ...}
//const tupleate = (items, key) => items.reduce((dict, value) => Object.assign(dict, {[value[key]]: value}), {});

export class DataGraph extends Xen.Async {
  static get observedAttributes() {
    return ['object'];
  }
  get template() {
    return template;
  }
  update({object}, state) {
    if (!state.selected) {
      state.selected = 'ActionChooser';
    }
    if (object) {
      if (state.object !== object) {
        //console.warn(object);
        state.object = object;
        this.generateArcGraphs(object, state);
      }
      this.updateSelected(state);
    } else if (!state.parsed) {
      state.parsed = true;
      this.generateGraphs(state);
    }
  }
  updateSelected({selected, graph, bits}) {
    if (graph && bits) {
      const container = d3
        .select(this._dom.root)
        .selectAll('svg')
        .select('g:nth-child(1)')
        ;
      const selection = container
        .selectAll('g')
        .data(bits.nodes)
        ;
      const hi = d => d.name === selected;
      selection
        .selectAll('circle')
        .attr('opacity', d => hi(d) ? '1.0' : '0.1')
        ;
      selection
        .selectAll('text:nth-child(3)')
        .attr("opacity", d => hi(d) ? "1.0" : "0.3")
        //.attr('stroke', d => hi(d) ? '#fff' : '#333')
        ;
    }
  }
  async generateArcGraphs(object, state) {
    if (object?.stores && object?.hosts) {
      state.bits = await this.generateArcGraph(object);
      const scale = 100;
      const width = 3 * scale;
      const height = 4 * scale;
      state.graph = renderForceGraph(state.bits, width, height);
      this.installGraph(state.graph);
    }
  }
  async generateGraphs({panel0, panel1}) {
    const parsed = await this.parse();
    const graph = await this.generateGraph(parsed);
    this.installGraph(graph);
  }
  async parse() {
    const parser = new Parser();
    recipes.forEach(r => parser.parse(r));
    return parser;
  }
  isSelectedParticle(name) {
    return name === this.state.selected;
  }
  generateArcGraph({stores, hosts}) {
    const links = [];
    const bound = [];
    // top level of `hosts` is actually users
    const users = hosts;
    let allHosts = {};
    // gather hosts for all users
    Object.values(users).forEach(hosts => allHosts = {...allHosts, ...hosts});
    // for each host
    const particles = !allHosts ? [] : Object.entries(allHosts)
      // only deal with linked particles
      //.filter(([id, h]) => h.meta?.bindings)
      // construct a node for the host and links for bindings
      .map(([id, h]) => {
        const hi = this.isSelectedParticle(id);
        const particle = {
          ...h.meta,
          hi,
          group: GROUP.PARTICLE,
          id: id,
          name: id,
          onclick: d => {
            this.mergeState({selected: id});
          }
        };
        // build links using bindings
        h.meta?.inputs && h.meta.inputs.forEach(input => {
          const key = Object.keys(input)[0];
          const value = input[key];
          // add a link between this particle and the target store
          const target = value || key;
            links.push({
              hi,
              source: id,
              target,
              strength: 0.0001
            });
            if (hi) {
              bound.push(target);
            }
          }
        );
        // return a node for the particle
        return particle;
      })
      ;
    //
    const points = !stores ? [] : entries(stores)
      .map(([name, value]) => ({
        ...value.meta,
        name,
        id: name,
        hi: bound.includes(name), //value.meta.name === 'ActionChooser',
        group: GROUP.STORE
      }))
      ;
    // assemble the info
    const nodes = [
      //{id: 'Arc', group: 0},
      ...points,
      ...particles
    ];
    nodes.sort((a, b) => (a?.hi ? 1 : b?.hi ? -1 : 1));
    //console.log(nodes);
    //const _links = [];
    const _links = links;
    return {links: _links, nodes};
  }
  generateGraph(parsed) {
    // generate a set of links or edges
    const links = [];
    const stores = parsed.stores.map(s => ({...s, id: s.name, group: GROUP.STORE}));
    // for each particle with bindings
    const particles = parsed.particles.filter(p => p.spec?.$inputs || p.spec?.$outputs).map(p => {
      // for each binding
      [...(p.spec?.$inputs || []), ...(p.spec?.$outputs || [])].forEach(
        // add a link between this particle and the target store
        ([key, value]) => links.push({source: p.id, target: value || key, strength: 0.0001}
      ));
      return {...p.spec, group: GROUP.PARTICLE, id: p.id, name: p.id};
    });
    // assemble the info
    const nodes = [
      ...stores,
      ...particles
    ];
    const scale = 100;
    const width = 3 * scale;
    const height = 4 * scale;
    return renderForceGraph({links, nodes}, width, height);
  }
  installGraph(graph) {
    const container = this._dom.root;
    //while (container.firstElementChild) container.firstElementChild.remove();
    container.innerHTML = '';
    container.appendChild(graph);
  }
}

customElements.define('data-graph', DataGraph);
