/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {SafeObject} from '../Isolation/safe-object.js';
import {logFactory} from '../Core/utils.js';

const log = logFactory(true, 'RecipeBuilder', 'darkorange', 'darkblue');

const {keys, entries, assign} = SafeObject;

export const RecipeBuilder = {
  defaultContainer: 'main#graph',
  idDelim: ':',
  connectorDelim: '$$',
  state: {
    storeMap: {}
  },

  constructId(id, name) {
    return `${id ? `${id}${this.idDelim}` : ''}${name}`;
  },

  construct({graph, nodeTypes, layout}) {
    return this.recipesForGraph({graph, nodeTypes, layout}, this.state)
  },

  recipesForGraph(inputs, state) {
    return entries(inputs.graph.nodes)
      .map(([n, v]) => ({id: n, ...v}))
      .map(node => this.recipeForNode(node, inputs, state))
      .filter(recipe => recipe)
      ;
  },

  recipeForNode(node, {graph, nodeTypes, layout}, state) {
    const rawNodeType = nodeTypes?.[node?.type] ?? nodeTypes?.LibrarianNode;
    const nodeType = this.flattenNodeType(rawNodeType);
    log('recipeForNode', node, nodeType);
    return {
      $stores: this.buildStoreSpecs(node, nodeType, state),
      $meta: {
        name: this.encodeFullNodeId(node, graph, this.connectorDelim),
        custom: nodeType.$meta?.custom
      },
      ...this.buildParticleSpecs(node, nodeType, layout, state)
    };
  },

  flattenNodeType(nodeType, $container) {
    const flattened = {};
    keys(nodeType).forEach(key => {
      if (key.startsWith('$')) {
        flattened[key] = nodeType[key];
      } else {
        assign(flattened, this.flattenParticleSpec(key, nodeType[key], $container));
      }
    });
    return flattened;
  },

  flattenParticleSpec(particleId, particleSpec, $container) {
    const flattened = {
      [particleId]: {
        ...particleSpec,
        $slots: {},
        ...($container && {$container})
      }
    };
    entries(particleSpec.$slots || {}).forEach(([slotId, slotRecipe]) => {
      assign(flattened, this.flattenNodeType(slotRecipe, `${particleId}#${slotId}`));
    });
    return flattened;
  },

  /* */

  buildStoreSpecs(node, nodeType, state) {
    const specs = {};
    entries(nodeType?.$stores).forEach(([name, store]) => {
      state.storeMap[name] = [];
      if (store.connection) {
        const connections = node.connections?.[name];
        connections?.forEach(connection => state.storeMap[name].push(connection));
      } else {
        const storeId = this.constructId(node.id, name);
        specs[storeId] = this.buildStoreSpec(store, node.props?.[name], node);
        state.storeMap[name].push(storeId);
      }
    });
    return specs;
  },

  buildStoreSpec(store, value, node) {
    return {
      $type: store.$type,
      $tags: store.$tags,
      $value: this.formatStoreValue(store, value, node)
    };
  },

  /* */

  buildParticleSpecs(node, nodeType, layout, {storeMap}) {
    const specs = {};
    const containerId = this.constructId(node.id, 'Container')
    const container = layout?.[containerId] || this.defaultContainer;
    const names = this.getParticleNames(nodeType) || [];
    for (const particleName of names) {
      const particleId = this.constructId(node.id, particleName);
      specs[particleId] = this.buildParticleSpec(node, nodeType, particleName, container, storeMap);
    }
    return specs;
  },

  getParticleNames(recipe) {
    const notKeyword = name => !name.startsWith('$');
    return recipe && keys(recipe).filter(notKeyword);
  },

  buildParticleSpec(node, nodeType, particleName, container, storeMap) {
    const particleSpec = nodeType[particleName];
    const $container = this.resolveContainer(node.id, particleSpec.$container, container);
    const bindings = this.resolveBindings(particleSpec, storeMap);
    const resolvedSpec = {
      $slots: {},
      $staticInputs: node.props,
      ...particleSpec,
      ...bindings,
      ...($container && {$container})
    };
    return resolvedSpec;
  },

  resolveContainer(nodeName, containerName, defaultContainer) {
    return containerName ? this.constructId(nodeName, containerName) : defaultContainer;
  },

  resolveBindings(particleSpec, storeMap) {
    const {$inputs, $outputs} = particleSpec;
    return {
      $inputs: this.resolveIoGroup($inputs, storeMap),
      $outputs: this.resolveIoGroup($outputs, storeMap),
    };
  },

  resolveIoGroup(bindings, storeMap) {
    return bindings?.map(coded => {
      const {key, binding} = this.decodeBinding(coded);
      const task = (store, index) => ({[`${key}${index === 0 ? '' : index}`]: store});
      return storeMap[binding || key]?.map(task);
    }).flat().filter(i=>i);
  },

  decodeBinding(value) {
    if (typeof value === 'string') {
      return {key: value, binding: ''};
    } else {
      const [key, binding] = entries(value)[0];
      return {key, binding};
    }
  },

  formatStoreValue(store, value, node) {
    if (value !== undefined) {
      return value;
    }
    // TODO(mariakleiner): Revisit how to express special default values supported by RecipeBuilder.
    if (store.value === 'node.id') {
      return node.id;
    }
    return store.$value;
  },

  encodeFullNodeId({id}, {$meta}, delimiter) {
    return [$meta?.id, id].filter(i=>i).join(delimiter);
  }
};
