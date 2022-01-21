/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {logFactory} from '../utils/log.js';

const log = logFactory(logFactory.flags.recipe, 'ParticleCook', '#096f33');

type pojo = Record<string, unknown>;

export type ParticleSpec = {
  $kind: string,
  $bindings?: pojo,
  $inputs?: pojo,
  $container: string,
  $slots?: {
    // name: SlotSpec
  }
  $meta?: {
    surface: ''
    // ingress: ''
  }
  $claims?: pojo,
  $checks?: pojo
};

export type ParticleNode = {
  id: string,
  container: string,
  spec: ParticleSpec
};

export class ParticleCook {
  static async execute(runtime, arc, plan) {
    // serial
    for (const particle of plan.particles) {
      await this.realizeParticle(runtime, arc, particle);
    }
    // parallel
    //return Promise.all(plan.particles.map(particle => this.realizeParticle(runtime, arc, particle)));
  }
  static async realizeParticle(runtime, arc, node: ParticleNode) {
    // convert spec to metadata
    const meta = this.specToMeta(node.spec);
    meta.container ||= node.container;
    // make a (hosted) particle
    return runtime.bootstrapParticle(arc, node.id, meta);
  }
  static specToMeta(spec) {
    // TODO(sjmiles): impedance mismatch here is likely to cause problems
    const {$kind: kind, $container: container, $inputs: inputs, $bindings: bindings} = spec;
    return {kind, inputs, bindings, container};
  }
  static async evacipate(runtime, arc, plan) {
    return Promise.all(plan.particles.map(particle => this.derealizeParticle(runtime, arc, particle)));
  }
  static async derealizeParticle(runtime, arc, node: ParticleNode) {
    arc.removeHost(node.id);
  }
}