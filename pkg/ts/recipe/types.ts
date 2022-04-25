/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

import {Dictionary} from '../utils/types.js';
export {Dictionary};

export {StoreMeta} from '../core/types.js';

type pojo = Record<string, unknown>;

type Type = string;
export type Tag = string;

/* eslint-disable @typescript-eslint/no-explicit-any */

export type StoreSpec = {
  name: string;
  type: string;
  value?: any;
  tags?: [string];
};

export type SlotSpec = {
  $meta?: any, // arbitrary
  $stores?: Dictionary<StoreSpec>,
  $type: Type,
  $tags: Tag[],
  $value?: any,
}; // TODO: & Dictionary<ParticleSpec>;

export type RecipeSpec = SlotSpec;
export type Recipe = {
  $meta?: any, // arbitrary
  $stores?: Dictionary<StoreSpec>,
  $type: Type,
  $tags: Tag[],
  $value?: any,
}; // TODO: & Dictionary<ParticleSpec>;

export type Container = string;
export type ParticleId = string;
export type Store = any;
export type Slot = {$name: string, $parent?: string} & Recipe;
export type Plan = {stores: StoreSpec[]};

export type ParticleSpec = {
  $kind: string,
  $bindings?: pojo,
  $inputs?: pojo,
  $staticInputs?: pojo,
  $container: string,
  $slots?: Dictionary<SlotSpec>,
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
