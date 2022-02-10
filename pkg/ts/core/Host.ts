/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../utils/log.js';
import {deepEqual} from '../utils/object.js';
import {arand} from '../utils/rand.js';
import {Decorator} from './Decorator.js';
import {Particle, Eventlet} from './Particle.js';

export type ParticleMeta = {
  kind: string,
  container: string
  inputs?;
  bindings?;
  // arbitrary field definitions
};

const {entries} = Object;

const customLogFactory = (id: string) => logFactory(logFactory.flags.host, `Host (${id})`, arand(['#5a189a','#51168b', '#48137b', '#6b2fa4','#7b46ae', '#3f116c']));

/**
 * Host owns metadata (e.g. `id`, `container`) that its Particle is not allowed to access.
 * Host knows how to talk, asynchronously, to its Particle (potentially using a bus).
**/

/* TODO(sjmiles):
Update Cycle Documented Briefly
1. when a Store changes it invokes it's listeners
2. when an Arc hears a Store change, it updates Hosts bound to the Store
3. Arc updates Host by creating an `inputs` object from Stores and metadata
   - ignores fact inputs are accumulated
   - ignores information about which Store has updated
4. `inputs` object is assigned to `hosts.inputs` 🙃
5. Host does an expensive `deepEqual` equality check. Turning on `host` logging should reveal `this.log('inputs are not interesting, skipping update');` if data is caught in this trap
   - we can use reference testing here if we are more careful
     about using immutable data
6. the particle.inputs are assigned (but is really a *merge*)
*/
export class Host {
  arc;
  composer;
  id;
  lastOutput;
  log;
  meta: ParticleMeta;
  particle: Particle;
  constructor(id) {
    this.log = customLogFactory(id);
    this.id = id;
  }
  async bindToSurface(surface, rootSlot='root') {
    // create composer
    this.composer = await surface.createComposer(rootSlot);
    // set up pipeline for events from surface to arc
    this.composer.onevent = this.onevent.bind(this);
  }
  onevent(eventlet) {
    this.arc?.onevent(eventlet);
  }
  // Particle and ParticleMeta are separate, host specifically integrates these on behalf of Particle
  installParticle(particle: Particle, meta?: ParticleMeta) {
    if (this.particle) {
      this.detachParticle();
    }
    if (particle) {
      this.attachParticle(particle);
      this.meta = meta || this.meta;
    }
  }
  get container() {
    return this.meta?.container || 'root';
  }
  detach() {
    this.detachParticle();
    this.arc = null;
  }
  protected attachParticle(particle: Particle) {
    this.particle = particle;
  }
  protected detachParticle() {
    const {particle} = this;
    if (particle) {
      this.render({$clear: true});
      this.particle = null;
      this.meta = null;
    }
  }
  protected async service(request) {
    if (request?.decorate) {
      return Decorator.maybeDecorateModel(request.model, this.particle);
    }
    return this.arc?.service(this, request);
  }
  protected output(outputModel, renderModel) {
    if (outputModel) {
      this.lastOutput = outputModel;
      this.arc?.assignOutputs(this, outputModel);
    }
    if (this.template) {
      Decorator.maybeDecorateModel(renderModel, this.particle);
      this.log(renderModel);
      this.render(renderModel);
    }
  }
  protected render(model) {
    const {id, container, template} = this;
    this.arc?.render({id, container, content: {template, model}});
  }
  protected trap(func) {
//    try {
      return func();
//    } catch(x) {
//      throw x;
//    }
  }
  set inputs(inputs) {
    if (this.particle && inputs) {
      const lastInputs = this.particle.internal.inputs;
      const dirty = !lastInputs || this.dirtyCheck(inputs, lastInputs, this.lastOutput);
      if (dirty) {
        this.particle.inputs = {...this.meta?.inputs, ...inputs};
      } else {
        this.log('inputs are not interesting, skipping update');
      }
    }
  }
  dirtyCheck(inputs, lastInputs, lastOutput) {
    return entries(inputs).some(([n, v]) => (lastOutput?.[n] && !deepEqual(lastOutput[n], v)) || !deepEqual(lastInputs?.[n], v));
  }
  get config() {
    return this.particle?.config;
  }
  get template() {
    return this.config?.template;
  }
  invalidate() {
    this.particle?.invalidate();
  }
  handleEvent(eventlet: Eventlet) {
    return this.particle?.handleEvent(eventlet);
  }
}
