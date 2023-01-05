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
import {Parser} from './RecipeParser.js';
import {StoreCook} from './StoreCook.js';
import {ParticleCook} from './ParticleCook.js';
import {Recipe} from './types.js';

const log = logFactory(logFactory.flags.recipe, 'Chef', '#087f23');

const {assign, create} = Object;
const entries = (o):any[] => Object.entries(o ?? Object);
const keys = (o):any[] => Object.keys(o ?? Object);
const values = (o):any[] => Object.values(o ?? Object);
const nob = () => create(null);

export class Chef {
  // static async executeG(graph: any, layoutId: any, nodeTypes: any, runtime: Runtime, arc: Arc) {
  //   log(`EXECUTE GRAPH`);
  //   /////////////////////////////////////////////////////
  //   const layout = graph.layout?.[layoutId];
  //   const stores = [];
  //   const storeMap = {};
  //   values(graph.nodes).forEach(({id, type, connections, props})=> {
  //     const nodeType = Chef.flattenNodeType(nodeTypes[type]) as any;
  //     // TODO(mariakleiner): flatten nodetype
  //     entries(nodeType.$stores).forEach(([name, store]) => {
  //       storeMap[name] = [];
  //       // const store = {...}
  //       if (connections?.[name]) {
  //         connections[name].forEach?.(connId => storeMap[name].push({id: connId, tags: store.$tags}));
  //       } else {
  //         const storeId = `${id ? `${id}:` : ''}${name}`;
  //         const value = props?.[name] || store.$value;
  //         stores.push({
  //           name: storeId,
  //           tags: store.$tags, // collect tags from all connected stores
  //           type: store.$type,
  //           value
  //         });
  //         storeMap[name].push({id: storeId});
  //       }
  //     });
  //   });
  //   log(`STORES: ${JSON.stringify(stores)}`);
  //   await StoreCook.execute(runtime, arc, stores);
  //   /////////////////////////////////////////////////////
  //   const particles = [];
  //   values(graph.nodes).forEach(({id, type, connections, props}) => {
  //     const nodeType = Chef.flattenNodeType(nodeTypes[type]);
  //     const containerId = `${id ? `${id}:` : ''}Container`;
  //     const defaultContainer = layout?.[containerId] || 'main#graph';

  //     const decodeBinding = value => {
  //       if (typeof value === 'string') {
  //         return {key: value, binding: ''};
  //       } else {
  //         const [key, binding] = entries(value)[0];
  //         return {key, binding};
  //       }
  //     };
    
  //     keys(nodeType).forEach(name => {
  //       if (!name.startsWith('$')) {
  //         const particleId = `${id ? `${id}:` : ''}${name}`;
  //         const spec = nodeType[name];
  //         const resolveIoGroup = bindings => {
  //           return bindings?.map(coded => {
  //             const {key, binding} = decodeBinding(coded);
  //             const task = (store, index) => ({[`${key}${index === 0 ? '' : index}`]: store});
  //             return storeMap[binding || key]?.map(({id}, i) => task(id, i));
  //           }).flat().filter(i=>i);
  //         };        
  //         //
  //         const particle = {
  //           id: particleId,
  //           container: spec.$container ? `${id}:${spec.$container}` : defaultContainer,
  //           spec: {
  //             $kind: spec.$kind,
  //             $staticInputs: props,
  //             $inputs: resolveIoGroup(spec.$inputs),
  //             $outputs: resolveIoGroup(spec.$outputs),
  //             $slots: { /* TODO */ }
  //           }
  //         };
  //         particles.push(particle); 
  //       }    
  //     });
  //   });
  //   log(`PARTICLES: ${JSON.stringify(particles)}`);
  //   await ParticleCook.execute(runtime, arc, particles);
  // }

  // static flattenNodeType(nodeType: any, $container?: any) {
  //   const flattened = {};
  //   keys(nodeType).forEach(key => {
  //     if (key.startsWith('$')) {
  //       flattened[key] = nodeType[key];
  //     } else {
  //       assign(flattened, Chef.flattenParticleSpec(key, nodeType[key], $container));
  //     }
  //   });
  //   return flattened;
  // }

  // static flattenParticleSpec(particleId: any, particleSpec: any, $container: any) {
  //   const flattened = {
  //     [particleId]: {
  //       ...particleSpec,
  //       $slots: {},
  //       ...($container && {$container})
  //     }
  //   };
  //   entries(particleSpec.$slots || {}).forEach(([slotId, slotRecipe]) => {
  //     assign(flattened, Chef.flattenNodeType(slotRecipe, `${particleId}#${slotId}`));
  //     flattened[particleId].$slots[slotId] = {};
  //   });
  //   return flattened;
  // }

  // static async evacipateG(graph: Object, nodeTypes: Object, runtime: Runtime, arc: Arc) {
  //   log(`EVACIPATE GRAPH`);
  // }

  static async execute(recipe: Recipe, runtime: Runtime, arc: Arc) {
    if (arc instanceof Promise) {
      log.error('`arc` must be an Arc, not a Promise. Make sure `boostrapArc` is awaited.');
      return;
    }
    //log.groupCollapsed('executing recipe...', recipe.$meta);
    log('|-->...| executing recipe: ', recipe);
    const plan = new Parser(recipe);
    // `store` preparation
    await StoreCook.execute(runtime, arc, plan.stores);
    // `particle` preparation
    await ParticleCook.execute(runtime, arc, plan.particles);
    // seasoning
    // TODO(sjmiles): what do we use this for?
    arc.meta = {...arc.meta, ...plan.meta};
    log('|...-->| recipe complete: ', recipe.$meta ?? '');
    //log.groupEnd();
  }
  static async evacipate(recipe: Recipe, runtime: Runtime, arc: Arc) {
    //log.groupCollapsed('evacipating recipe...', recipe.$meta);
    log('|-->...| evacipating recipe: ', recipe.$meta);
    // TODO(sjmiles): this is work we already did
    const plan = new Parser(recipe);
    // `store` work
    // TODO(sjmiles): not sure what stores are unique to this plan
    await StoreCook.evacipate(runtime, arc, plan.stores);
    // `particle` work
    await ParticleCook.evacipate(runtime, arc, plan.particles);
    // seasoning
    // TODO(sjmiles): doh
    //arc.meta = {...arc.meta, ...plan.meta};
    log('|...-->| recipe evacipated: ', recipe.$meta);
    //log.groupEnd();
  }
  static async executeAll(recipes: Recipe[], runtime: Runtime, arc: Arc) {
    for (const recipe of recipes) {
      await this.execute(recipe, runtime, arc);
    }
  }
  static async evacipateAll(recipes: Recipe[], runtime: Runtime, arc: Arc) {
    for (const recipe of recipes) {
      await this.evacipate(recipe, runtime, arc);
    }
  }
}
