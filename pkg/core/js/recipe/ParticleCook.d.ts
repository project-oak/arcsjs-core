/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Runtime } from '../Runtime.js';
import { ParticleNode } from './types.js';
export declare class ParticleCook {
    static execute(runtime: Runtime, arc: any, particles: any): Promise<void>;
    static realizeParticle(runtime: Runtime, arc: any, node: ParticleNode): Promise<any>;
    static specToMeta(spec: any): {
        kind: any;
        staticInputs: any;
        inputs: any;
        outputs: any;
        container: any;
    };
    static formatBindings(bindings: any): any;
    static evacipate(runtime: Runtime, arc: any, particles: any): Promise<any[]>;
    static derealizeParticle(runtime: Runtime, arc: any, node: ParticleNode): Promise<void>;
}
