/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
 import {checkState} from '../lib/test-utils.js';
 import { initSes, createSesParticleFactory } from '../../js/isolation/ses.js';

 export const testHardenOverridable = async () => {
   initSes();
   const factory = await createSesParticleFactory('Foo', {
    code: `({ 
            harden(x) { return x; },
            foo() { 
                foo.x = 1 + (foo.x || 0);
                return foo.x;
            } 
        })`
   });

   const particle = factory({ output() {}, service() { }});
   let x;
   try {
     particle.impl.foo();
     x = particle.impl.foo();
   } catch (e) {
     // should throw 'not extensible' when fixed
     return checkState({msg: e.message}, {msg: 'Cannot add property x, object is not extensible'});
   }

   // should change to failure (unreachable line) when fixed
   return checkState({x}, {x: 2});
 };
 
 