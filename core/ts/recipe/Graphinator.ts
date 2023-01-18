/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {logFactory} from '../utils/log.js';
import {deepEqual} from '../utils/object.js';
import {Arc} from '../core/Arc.js';
import {Runtime} from '../Runtime.js';
import {StoreCook} from './StoreCook.js';
import {ParticleCook} from './ParticleCook.js';

const log = logFactory(logFactory.flags.graph, 'Graphinator', '#7f0823');

const {assign, create} = Object;
const entries = (o):any[] => Object.entries(o ?? Object);
const keys = (o):any[] => Object.keys(o ?? Object);
const values = (o):any[] => Object.values(o ?? Object);

const idDelim = ':';

export class Graphinator {
  nodeTypes: any;
  storeTags: any;

  constructor(nodeTypes: any, protected runtime: Runtime, protected arc: Arc) {
    this.nodeTypes = {};
    this.storeTags = {};
    keys(nodeTypes).forEach(t => this.nodeTypes[t] = this.flattenNodeType(nodeTypes[t]));
  }

  flattenNodeType(nodeType: any, $container?: any, flatNodeType?: any) {
    flatNodeType ??= {};
    keys(nodeType).forEach(key => {
      if (key.startsWith('$')) {
        flatNodeType[key] = {...nodeType[key], ...(flatNodeType[key] || {})};
      } else {
        assign(flatNodeType, this.flattenParticleSpec(key, nodeType[key], $container, flatNodeType));
      }
    });
    return flatNodeType;
  }

  flattenParticleSpec(particleId: any, particleSpec: any, $container: any, flatNodeType) {
    const flattened = {
      [particleId]: {
      ...particleSpec,
      $slots: {},
      ...($container && {$container})
      }
    };
    entries(particleSpec.$slots || {}).forEach(([slotId, slotRecipe]) => {
      assign(flattened, this.flattenNodeType(slotRecipe, `${particleId}#${slotId}`, flatNodeType));
      flattened[particleId].$slots[slotId] = {};
    });
    return flattened;
  }

  async execute(graph: any, {id: layoutId, defaultContainer}) {
    const layout = graph.layout?.[layoutId || 'preview'];
    const stores = [];
    const particles = [];
    values(graph.nodes).forEach(node => {
      const nodeType = this.nodeTypes[node.type];
      if (!nodeType) {
        throw(`node.type "${node.type}" not found`);
      }
      const connsMap = {};
      this.prepareStores(node, nodeType, stores, connsMap);
      this.prepareParticles(node, layout, defaultContainer, connsMap, particles);
    });
    this.retagStoreSpecs(stores);
    log('Executing', {graph, stores, particles});
    //log('Executing graph: ', stores, particles);
    await StoreCook.execute(this.runtime, this.arc, stores);
    await this.realizeParticles(particles);
    return particles.map(({id}) => id);
  }

  prepareStores({id, connections, props}, nodeType, stores, connsMap) {
    entries(nodeType.$stores).forEach(([name, store]) => {
      connsMap[name] = [];
      const storeId = this.constructId(id, name);
      const storeValue = props?.[name] || store.$value;
      const storeConns = connections?.[name];
      this.prepareStore(storeId, store, storeValue, storeConns, stores, connsMap[name]);
    });
  }

  prepareStore(storeId, {$type: type, $tags}, value, connections, stores, storeEntry) {
    if (connections?.length > 0) {
      connections?.forEach?.(connId => this.addStore(connId, $tags, storeEntry));
    } else {
      stores.push({name: storeId, type, value});
      this.addStore(storeId, $tags, storeEntry);
    }
  }

  addStore(storeId, tags, storeEntry) {
    storeEntry.push({id: storeId});
    this.storeTags[storeId] = [...(this.storeTags[storeId] || []), ...(tags || [])];
  }

  retagStoreSpecs(stores) {
    stores.forEach(store => store.tags = this.storeTags[store.name]);
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

  prepareParticles(node, layout, defaultContainer, storeMap, particles) {
    const nodeType = this.nodeTypes[node.type];
    const containerId = this.constructId(node.id, 'Container');
    const container = layout?.[containerId] || defaultContainer;
    this.getNodeParticleNames(nodeType).forEach(name => {
      particles.push(this.prepareParticle(node, name, container, nodeType, storeMap));
    });
  }

  prepareParticle({id, props}, particleName, container, nodeType, storeMap) {
    const particleId = this.constructId(id, particleName);
    const spec = nodeType[particleName];
    const $staticInputs = Object.assign({}, props || {}, spec.$staticInputs || {});
    return {
      id: particleId,
      spec: {
        $kind: spec.$kind,
        $staticInputs,
        $inputs: this.resolveIoGroup(spec.$inputs, storeMap),
        $outputs: this.resolveIoGroup(spec.$outputs, storeMap),
        $slots: {},
        $container: this.resolveContainer(id, spec.$container, container)
      }
    };
  }

  constructId(id, name) {
    return `${id ? `${id}${idDelim}` : ''}${name}`;
  }

  resolveContainer(id, containerName, defaultContainer) {
    return containerName ? this.constructId(id, containerName) : defaultContainer;
  }

  async realizeParticles(particles) {
    const runningParticles = particles.filter(({id}) => this.arc.hosts[id]);
    runningParticles.forEach(particle => this.updateParticleHosts(particle));
    const newParticles = particles.filter(({id}) => !this.arc.hosts[id]);
    await ParticleCook.execute(this.runtime, this.arc, newParticles);
    const removedParticles = this.findRemovedParticles(particles);
    await ParticleCook.evacipate(this.runtime, this.arc, removedParticles);
  }

  findRemovedParticles(particles) {
    const runningGraphParticleIds = keys(this.arc.hosts).filter(id => {
      const container = this.arc.hosts[id].meta.container;
      if (container?.includes('designer#graph')) {
        return true;
      }
      const containerParticle = container?.split('#')?.[0];
      return particles.some(({id}) => id === containerParticle);
    });
    const removedParticleIds = runningGraphParticleIds.filter(id => !particles.some(({id:graphId}) => id === graphId));
    return removedParticleIds.map(id => ({id}));
  }

  updateParticleHosts({id, spec}) {
    const host = this.arc.hosts[id];
    if (host.container !== spec.$container) {
      host.meta.container = spec.$container;
      Object.values(this.arc.hosts).forEach(host => host.rerender());
    }
    const meta = ParticleCook.specToMeta(spec);
    if (!deepEqual(meta, host.meta)) {
      host.meta = meta;
      this.arc.updateHost(host);
    }
  }

  async evacipate(graph: any) {
    log('Evacipating graph', graph);
    await StoreCook.removeStores(this.runtime, this.arc, this.getStoreNames(graph));
    await ParticleCook.removeParticles(this.arc, this.getParticleNames(graph));
  }

  getParticleNames(graph: any) {
    const names = [];
    values(graph.nodes).forEach(({id, type}) => {
      this.getNodeParticleNames(this.nodeTypes[type]).forEach(
        name => names.push(this.constructId(id, name)));
    });
    return names;
  }

  getNodeParticleNames(nodeType) {
    return keys(nodeType).filter(id => !id.startsWith('$'))
  }

  getStoreNames(graph: any) {
    const names = [];
    values(graph.nodes).forEach(({id, type}) =>  {
      const nodeType = this.nodeTypes[type];
      keys(nodeType.$stores).forEach(storeId => {
        names.push(this.constructId(id, storeId));
      });
    });
    return names;
  }
}
