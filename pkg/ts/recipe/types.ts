/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {Dictionary} from '../utils/types.js';
export {StoreMeta} from '../core/types.js';

export {Dictionary};

export type Tag = string;

type Pojo = Record<string, unknown>;
type Type = string;

/* eslint-disable @typescript-eslint/no-explicit-any */

export type StoreSpec = {
  $name: string;
  $type: string;
  $value?: Pojo;
  $tags?: [string];
};

type ParticleDictionary = Dictionary<ParticleSpec>;

export type SlotSpec = {
  $meta?: Pojo,
  $stores?: Dictionary<StoreSpec>,
  $type: Type,
  $tags: Tag[],
  $value?: Pojo,
} & ParticleDictionary;

export type Recipe = SlotSpec;

export type Container = string;
export type ParticleId = string;
export type Store = Pojo;
export type Slot = {$name: string, $parent?: string} & Recipe;

export type ParticleSpec = {
  $meta?: {
    // surface: ''
    // ingress: ''
  },
  $kind: string,
  $inputs?: Pojo,
  $outputs?: Pojo,
  $staticInputs?: Pojo,
  $container: string,
  $slots?: Dictionary<SlotSpec>,
  $claims?: Pojo,
  $checks?: Pojo,
  $bindings?: Pojo
};

export type ParticleNode = {
  id: string,
  container: string,
  spec: ParticleSpec
};
