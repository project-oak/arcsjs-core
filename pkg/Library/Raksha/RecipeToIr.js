/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
const STRING = 'stringPayload';

class Attribute {
  constructor(name, type, value) {
    this.name = name;
    this.type = type;
    this.value = value;
  }

  json() {
    return {
      [this.name]: {
        [this.type]: this.value
      }
    }
  }

  ir() {
    return `${this.name}: "${this.value}"`;
  }
}

class Input {
  constructor(id) {
    this.id = id;
  }

  json() {
    return {
      "operationResultValue": {
        "operationId": this.id,
        "outputName": "out"
      }
    }
  }

  ir() {
    return `%${this.id}`;
  }
}

class Operation {
  constructor(generator, name, inputs, attributes) {
    this.id = generator.nextId++;
    this.name = name;
    this.inputs = inputs;
    this.attributes = attributes;
    generator.addUsedOp(name);
  }

  ir() {
    return `%${this.id} = ${this.name}[${this.attributes.map(x => x.ir()).join(
        ', ')}](${this.inputs.map(i => i.ir()).join(', ')})`;
  }

  json() {
    return {
      "id": this.id,
      "operation": {
        "operatorName": this.name,
        "inputs": this.inputs.map(input => input.json()),
        "attributes": {
          // merge all attributes into an object
          "attributes": this.attributes.map(
              attribute => attribute.json()).reduce(
              (obj, json) => Object.assign(obj, json), {})
        }
      }
    }
  }
}

class Store extends Operation {
  constructor(generator, storeName, $store) {
    super(generator, 'arcsjs.create_store', [], [
      new Attribute("name", STRING, `${generator.recipeName}.${storeName}`),
      new Attribute("type", STRING, $store.$type.replace('[', 'List_').replace(']', ''))
    ]);
    this.generator = generator;
    this.storeName = storeName;
    this.$store = $store;
  }

  isPublicStore() {
    return this.$store.$tags && this.$store.$tags.includes('public');
  }

  isPrivateStore() {
    return this.$store.$tags && this.$store.$tags.includes('private');
  }
}

class PublicOp extends Operation {
  constructor(generator, inputId) {
    super(generator, 'sql.tag_transform', [new Input(inputId)], [
          new Attribute('rule_name', STRING, "set_public")
        ]
    );
  }
}

class PrivateOp extends Operation {
  constructor(generator, inputId) {
    super(generator, 'arcsjs.claim', [new Input(inputId)], [
          new Attribute('tag', STRING, "private")
        ]
    );
  }
}

class ConnectInputOp extends Operation {
  constructor(generator, handleName, inputId, store) {
    super(generator, 'arcsjs.connect_input', [new Input(inputId), new Input(store.id)],
        [
          new Attribute('name', STRING, handleName)
        ]);
    this.store = store;
  }
}

class ConnectOutputOp extends Operation {
  constructor(generator, handleName, inputId, store) {
    super(generator, 'arcsjs.connect_output', [new Input(inputId), new Input(store.id)],
        [
          new Attribute('name', STRING, handleName)
        ]);
    this.store = store;
  }
}

class OutputOp extends Operation {
  constructor(generator, handleName, inputIds) {
    super(generator, 'arcsjs.make_public',
        inputIds.map(inputId => new Input(inputId)),
        [
        ]);
  }
}

class UserAction extends Operation {
  constructor(generator, from, to, inputIds) {
    super(generator, "arcsjs.user_consent_to_downgrade",
        inputIds.map(inputId => new Input(inputId)), [
          new Attribute("downgrade_from", STRING, from),
          new Attribute("downgrade_to", STRING, to)
        ]);
  }
}

class Binding {
  constructor(generator, bindingName, store, isOutput) {
    this.bindingName = bindingName;
    this.store = store;
    this.op = this.isPublic() ? store
        : this.isPrivate() ? new PrivateOp(generator, store.id) : store;
    this.isOutput = isOutput;
  }

  get id() {
    return this.op.id;
  }

  isPublic() {
    return this.store.isPublicStore();
  }

  isPrivate() {
    return this.store.isPrivateStore();
  }

  ir() {
    return this.op.ir();
  }

  json() {
    return this.op.json();
  }
}

function mapBindings(generator, bindings, stores, isOutput) {
  return bindings
      .flatMap(x => typeof x === 'string' ? [[x, x]] : Object.entries(x))
      // ignore bindings that don't match a store
      // TODO: should omit warning?
      .filter(([bindingName, storeName]) => stores.has(storeName))
      .map(([bindingName, storeName]) => [bindingName,
        new Binding(generator, bindingName, stores.get(storeName), isOutput)])
}

class Particle extends Operation {
  constructor(generator, particleName, $particle, stores) {
    const bindingMap = new Map(
        mapBindings(generator, $particle.$inputs, stores, false).concat(
            mapBindings(generator, $particle.$outputs, stores, true)));

    const inputBindings = [...bindingMap.values()].filter(x => !x.isOutput);
    const inputs = inputBindings.map(binding => new Input(binding.id));
    const inputAttributes = inputBindings.map(
        (binding, index) => new Attribute("input_" + index, STRING,
            binding.bindingName));

    super(generator, "arcsjs.particle", [], [
      new Attribute("name", STRING, `${generator.recipeName}.${particleName}`)
    ]);

    this.particleName = particleName;
    this.$particle = $particle;
    this.storeMap = stores;
    this.bindingMap = bindingMap;
    this.input = inputBindings.map(
        binding => new ConnectInputOp(generator, binding.bindingName, this.id,
            binding.store));

    this.output = this.outputBindings().map(
        binding => new ConnectOutputOp(generator, binding.bindingName, this.id,
            binding.store));
    this.downgrades = Object.entries($particle.$events || {}).map(
        ([eventName, downgradeConfig]) => new UserAction(generator,
            downgradeConfig[0], downgradeConfig[1],
            // hack for demo
            [this.output[0].id, (this.output.length > 1 ? this.output[1] : this.output[0]).id]));
  }

  hasDowngrades() {
    return this.downgrades.length > 0;
  }

  bindings() {
    return [...this.bindingMap.values()];
  }

  publicBindings() {
    return this.bindings().filter(binding => binding.isPublic());
  }

  privateBindings() {
    return this.bindings().filter(binding => binding.isPrivate());
  }

  outputBindings() {
    return this.bindings().filter(binding => binding.isOutput);
  }

  downgradeOps() {
    return this.downgrades;
  }

}

export class PolicyGenerator {
  constructor(recipe, name) {
    this.nextId = 0;
    this.recipeName = name;
    this.recipe = this.maybeMerge(recipe);
    this.$particles = Object.entries(this.recipe)
        .filter(([key, value]) => !!value.$inputs);
    this.usedOps = new Set();

  }

  maybeMerge(recipes) {
    if (!Array.isArray(recipes)) {
      return recipes;
    }
    let merged = {};
    for (const recipe of recipes) {
      const {$stores, $meta, ...particles} = recipe;
      merged.$meta ??= $meta;
      merged.$stores = {...merged.$stores, ...$stores}
      merged = {...merged, ...particles};
    }
    return merged;
  }

  addUsedOp(name) {
    this.usedOps.add(name);
  }

  computeOperations(output) {
    // Construct all create_store operations first
    const stores = Object.entries(this.recipe.$stores).map(
        ([storeName, storeConfig]) => new Store(this, storeName, storeConfig));

    // Map of storeName => store
    const storeMap = new Map(stores.map(store => [store.storeName, store]));

    const particles = this.$particles.map(
        ([particleName, $particle]) => new Particle(this, particleName,
            $particle, storeMap));

    // Uses a set to de-dup stores
    const allReferencedStores = [...new Set(particles.flatMap(
        particle => particle.bindings()).map(binding => binding.store))];

    // Collect all-public bindings which need set_public tag
    const allPublicOps = particles.flatMap(
        particle => particle.publicBindings()).map(binding => binding.op);
    const allPrivateOps = particles.flatMap(
        particle => particle.privateBindings()).map(binding => binding.op);

    const allConnectOutputOps = particles.flatMap(particle => particle.output);
    const allConnectInputOps = particles.flatMap(particle => particle.input);

    const downgradeOps = particles.flatMap(particle => particle.downgradeOps());

    const outputOp =
        downgradeOps.map(op => op.id).concat(
            particles.filter(particle => !particle.hasDowngrades()).flatMap(
                p => p.output).filter(o => o.store.isPublicStore())
                .map(p => p.store.id)).map(id =>
            new OutputOp(this, "out", [id]));

    const allOps = allReferencedStores.concat(allPrivateOps).concat(
        particles).concat(allConnectInputOps).concat(allConnectOutputOps)
        .concat(downgradeOps).concat(outputOp).map(op => output(op));

    return allOps;
  }

  recipeToIr() {
    const allOps = this.computeOperations(op => op.ir());
    return `
module m0 {
  block b0 {
    ${allOps.join('\n    ')}
  }
}
    `;
  }

  recipeToPolicy() {
    const allOps = this.computeOperations(op => op.json());

    return {
      "topLevelModule": {
        "blocks": [
          {
            "id": this.nextId++,
            "block": {
              "operations": allOps
            }
          }]
      },
      "frontend": "Recipe2Policy.js",
      operators: [...this.usedOps].map(name => ({"name": name}))
    };
  }
}