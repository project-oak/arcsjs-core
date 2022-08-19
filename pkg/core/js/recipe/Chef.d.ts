/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import { Arc } from '../core/Arc.js';
import { Runtime } from '../Runtime.js';
import { Recipe } from './types.js';
export declare class Chef {
    static execute(recipe: Recipe, runtime: Runtime, arc: Arc): Promise<void>;
    static evacipate(recipe: Recipe, runtime: Runtime, arc: Arc): Promise<void>;
    static executeAll(recipes: Recipe[], runtime: Runtime, arc: Arc): Promise<void>;
    static evacipateAll(recipes: Recipe[], runtime: Runtime, arc: Arc): Promise<void[]>;
}
