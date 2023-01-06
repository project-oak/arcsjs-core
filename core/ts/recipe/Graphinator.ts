/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {logFactory} from '../utils/log.js';
import {Arc} from '../core/Arc.js';
import {Runtime} from '../Runtime.js';
import {StoreCook} from './StoreCook.js';
import {ParticleCook} from './ParticleCook.js';

const log = logFactory(logFactory.flags.recipe, 'Chef', '#087f23');

const {assign, create} = Object;
const entries = (o):any[] => Object.entries(o ?? Object);
const keys = (o):any[] => Object.keys(o ?? Object);
const values = (o):any[] => Object.values(o ?? Object);

const defaultContainer = 'main#graph';
const idDelim = ':';
const connectorDelim = '$$';


export class Graphinator {
  nodeTypes: any;
  allStoreSpecs: [];

  constructor(nodeTypes: any, protected runtime: Runtime, protected arc: Arc) {
    this.nodeTypes = {};
    this.allStoreSpecs = [];
    keys(nodeTypes).forEach(t => this.nodeTypes[t] = this.flattenNodeType(nodeTypes[t]));
  }

  flattenNodeType(nodeType: any, $container?: any) {
    const flattened = {};
    keys(nodeType).forEach(key => {
        if (key.startsWith('$')) {
        flattened[key] = nodeType[key];
        } else {
        assign(flattened, this.flattenParticleSpec(key, nodeType[key], $container));
        }
    });
    return flattened;
  }

  flattenParticleSpec(particleId: any, particleSpec: any, $container: any) {
    const flattened = {
        [particleId]: {
        ...particleSpec,
        $slots: {},
        ...($container && {$container})
        }
    };
    entries(particleSpec.$slots || {}).forEach(([slotId, slotRecipe]) => {
        assign(flattened, this.flattenNodeType(slotRecipe, `${particleId}#${slotId}`));
        flattened[particleId].$slots[slotId] = {};
    });
    return flattened;
  }

  async execute(graph: any, layoutId: any) {
    log(`EXECUTE GRAPH`);
    /////////////////////////////////////////////////////
    const layout = graph.layout?.[layoutId];
    const stores = [];
    const particles = [];
    // const storeMap = {};
    values(graph.nodes).forEach(node => {
      const connsMap = {};
      this.prepareStores(node, this.nodeTypes[node.type], stores, connsMap); //, storeMap);
      this.prepareParticles(node, layout, connsMap, particles);
    });
    /////////////////////////////////////////////////////
    // values(graph.nodes).forEach(node => { //({id, type, connections, props}) => {
    //   this.prepareParticles(node, layout, storeMap, particles);
    // });

    /////////////////////////////////////////////////////

    // TODO(mariakleiner): propagate tags from connected stores onto realized stores
    // this.retagStoreSpecs(state.storeMap, allSpecs);
    log(`STORES: ${JSON.stringify(stores)}`);
    log(`PARTICLES: ${JSON.stringify(particles)}`);

    await StoreCook.execute(this.runtime, this.arc, stores);
    await ParticleCook.execute(this.runtime, this.arc, particles);
  }

  prepareStores({id, connections, props}, nodeType, stores, connsMap) { //storeMap) {
    entries(nodeType.$stores).forEach(([name, store]) => {
      connsMap[name] = {}; //storeMap[name] = [];
      const storeId = this.constructId(id, name);
      const storeProps = props?.[name];
      const storeConns = connections?.[name];
      this.prepareStore(storeId, store, storeProps, storeConns, stores, connsMap[name]); //storeMap[name]);
    });
  }
  prepareStore(storeId, {$type, $value, $tags}, propValue, connections, stores, storeEntry) {
    if (connections) {
      connections.forEach?.(connId => storeEntry.push({id: connId, tags: $tags}));
    } else {
      stores.push({
        name: storeId,
        tags: $tags,
        type: $type,
        value: propValue || $value
      });
      storeEntry.push({id: storeId});
    }
  }

  resolveIoGroup(bindings, storeMap) {
    return bindings?.map(coded => {
      const {key, binding} = this.decodeBinding(coded);
      const task = (store, index) => ({[`${key}${index === 0 ? '' : index}`]: store});
      return storeMap[binding || key]?.map(({id}, i) => task(id, i));
    }).flat().filter(i=>i);
  }

  decodeBinding(value: string|Object) {
    if (typeof value === 'string') {
        return {key: value, binding: ''};
    } else {
        const [key, binding] = entries(value)[0];
        return {key, binding};
    }
  }

  prepareParticles(node, layout, storeMap, particles) {
    const nodeType = this.nodeTypes[node.type];
    const containerId = this.constructId(node.id, 'Container');
    const container = layout?.[containerId] || defaultContainer;

    keys(nodeType).forEach(name => {
      if (!name.startsWith('$')) {
        particles.push(this.prepareParticle(node, name, container, nodeType, storeMap));
      }    
    });
  }

  prepareParticle({id, props}, particleName, container, nodeType, storeMap) {
    const particleId = this.constructId(id, particleName);
    const spec = nodeType[particleName];
    //
    return {
      id: particleId,
      container: spec.$container ? `${id}:${spec.$container}` : container,
      spec: {
        $kind: spec.$kind,
        $staticInputs: props,
        $inputs: this.resolveIoGroup(spec.$inputs, storeMap),
        $outputs: this.resolveIoGroup(spec.$outputs, storeMap),
        $slots: {}
      }
    };
  }

  constructId(id, name) {
    return `${id ? `${id}${idDelim}` : ''}${name}`;
  }

  async evacipateG(graph: Object) { //, nodeTypes: Object, runtime: Runtime, arc: Arc) {
    log(`EVACIPATE GRAPH`);
  }
}
