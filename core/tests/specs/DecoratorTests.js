/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
 import {checkState} from '../lib/test-utils.js';
 import { initSes, createSesParticleFactory } from '../../js/isolation/ses.js';
 import { Decorator } from '../../js/core/Decorator.js';

 async function makeParticle(extraCode) {
    initSes();
    const factory = await createSesParticleFactory('Foo', {
     code: `({ 
             template: html\`
                <div>{{myfonts}}</div>
        
                  <template font_t>
                    <div>
                    <span flex name>{{name}}</span>
                    <span sample style$="{{displayStyle}}">Sample</span>
                 </div>
            </template>
             \`,

            render({fonts}) {
                return {
                    myfonts: {
                        models: fonts,
                        $template: 'font_t',
                        decorator: 'myDecorator'
                      }
                }
             }
            ${extraCode}
         })`
    });
    
    return factory({ output() {}, service() { }});
 }

 function makeTestData() {
    return [{name: "Arial", size: 8}, {name: "Courier", size: 12}];
 }

 export const testDecoratorStateIsImmutable = async () => {
    const particle = await makeParticle(
        `
            , myDecorator({name, size}, inputs, state) { 
                try {
                  assign(state, {foo: 42});
                } catch (e) {

                }
                return { newname: name, newsize: size};
            }       
    `);
    const beforeState = particle.internal.state;
    Decorator.setOpaqueData("fonts", makeTestData());
    const model = particle.impl.render({fonts: 'fonts'});
    Decorator.maybeDecorateModel(model, particle);
    const afterState = particle.internal.state;
    return checkState(beforeState, afterState);
  };
  
  export const testDecoratorDataIsImmutable = async () => {
    const particle = await makeParticle(
        `
            , myDecorator(model, inputs, state) { 
                try {
                  model.x = 42;
                } catch (e) {

                }
                return model;
            }       
    `);
    Decorator.setOpaqueData("fonts", makeTestData());
    const decoratedModel =  Decorator.maybeDecorateModel(particle.impl.render({fonts: 'fonts'}), particle);
    const afterDecorate = Decorator.getOpaqueData("fonts");
    return checkState({x: afterDecorate[0].x}, {x: undefined});
  };

  export const testInputsAndModelAreImmutable = async () => {
    const particle = await makeParticle(
        `
            , myDecorator(model, inputs, state) { 
                return {
                    modelFroze: Object.isFrozen(model),
                    inputsFroze: Object.isFrozen(inputs)
                }
            }       
    `);
    Decorator.setOpaqueData("fonts", makeTestData());
    const decoratedModel =  Decorator.maybeDecorateModel(particle.impl.render({fonts: 'fonts'}), particle);
    const {modelFroze, inputsFroze} = decoratedModel.myfonts.models[0];
    const afterDecorate = Decorator.getOpaqueData("fonts");
    return checkState({modelFroze: true, inputsFroze: true}, {modelFroze, inputsFroze});
  };

  export const testPrivateDataCanBeUpdated = async () => {
    const particle = await makeParticle(
        `
            , myDecorator({privateData}, inputs, state) { 
                return {privateData: { x: "Hello" + (privateData.x || "") } };
            }       
    `);
    Decorator.setOpaqueData("fonts", makeTestData());
    Decorator.maybeDecorateModel(particle.impl.render({fonts: 'fonts'}), particle);
    const decoratedModel =  Decorator.maybeDecorateModel(particle.impl.render({fonts: 'fonts'}), particle);
    return checkState({x: decoratedModel.myfonts.models[0].privateData.x}, {x: 'HelloHello'});
  };

  export const testPrivateDataUpdateDoNotMutateOriginalInput = async () => {
    const particle = await makeParticle(
        `
            , myDecorator({privateData}, inputs, state) { 
                return {privateData: { x: "Hello" + (privateData.x || "") } };
            }       
    `);
    const testData = makeTestData();
    Decorator.setOpaqueData("fonts", testData);
    Decorator.maybeDecorateModel(particle.impl.render({fonts: 'fonts'}), particle);
    return checkState({x: testData[0].privateData}, {x: undefined});
  };