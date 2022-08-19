/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Dictionary } from '../utils/types.js';
export { StoreMeta } from '../core/types.js';
export { Dictionary };
export declare type Tag = string;
export declare type Pojo = Record<string, unknown>;
export declare type Type = string;
export declare type StoreSpec = {
    $name: string;
    $type: string;
    $value?: Pojo;
    $tags?: [string];
};
export declare type ParticleDictionary = Dictionary<ParticleSpec>;
export declare type SlotSpec = {
    $meta?: Pojo;
    $stores?: Dictionary<StoreSpec>;
    $type: Type;
    $tags: Tag[];
    $value?: Pojo;
} & ParticleDictionary;
export declare type Recipe = SlotSpec;
export declare type Container = string;
export declare type ParticleId = string;
export declare type Store = Pojo;
export declare type Slot = {
    $name: string;
    $parent?: string;
} & Recipe;
export declare type ParticleSpec = {
    $meta?: {};
    $kind: string;
    $inputs?: Pojo;
    $outputs?: Pojo;
    $staticInputs?: Pojo;
    $container: string;
    $slots?: Dictionary<SlotSpec>;
    $claims?: Pojo;
    $checks?: Pojo;
};
export declare type ParticleNode = {
    id: string;
    container: string;
    spec: ParticleSpec;
};
