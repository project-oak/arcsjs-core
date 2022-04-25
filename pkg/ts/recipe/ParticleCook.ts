/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {logFactory} from '../utils/log.js';
import {Runtime} from '../Runtime.js';
import {ParticleNode} from './types.js';

const log = logFactory(logFactory.flags.recipe, 'ParticleCook', '#096f33');

export class ParticleCook {
  static async execute(runtime: Runtime, arc, plan) {
    // serial
    for (const particle of plan.particles) {
      await this.realizeParticle(runtime, arc, particle);
    }
    // parallel
    //return Promise.all(plan.particles.map(particle => this.realizeParticle(runtime, arc, particle)));
  }
  static async realizeParticle(runtime: Runtime, arc, node: ParticleNode) {
    // convert spec to metadata
    const meta = this.specToMeta(node.spec);
    meta.container ||= node.container;
    // make a (hosted) particle
    return runtime.bootstrapParticle(arc, node.id, meta);
  }
  static specToMeta(spec) {
    // TODO(sjmiles): impedance mismatch here is likely to cause problems
    const {$kind: kind, $container: container, $inputs: inputs, $staticInputs: staticInputs, $bindings: bindings} = spec;
    return {kind, inputs, bindings, container};
  }
  static async evacipate(runtime: Runtime, arc, plan) {
    return Promise.all(plan.particles.map(particle => this.derealizeParticle(runtime, arc, particle)));
  }
  static async derealizeParticle(runtime: Runtime, arc, node: ParticleNode) {
    arc.removeHost(node.id);
  }
}
