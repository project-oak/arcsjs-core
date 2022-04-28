/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {logFactory} from '../utils/log.js';
import {deepEqual} from '../utils/object.js';
import {arand} from '../utils/rand.js';
import {EventEmitter} from './EventEmitter.js';
import {Decorator} from './Decorator.js';
import {Particle, Eventlet} from './Particle.js';
import {ParticleMeta} from './types.js';

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
export class Host extends EventEmitter {
  arc;
  id;
  lastOutput;
  log;
  meta: ParticleMeta;
  particle: Particle;
  constructor(id) {
    super();
    this.log = customLogFactory(id);
    this.id = id;
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
      this.particle = particle;
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
  set inputs(inputs) {
    if (this.particle && inputs) {
      const lastInputs = this.particle.internal.inputs;
      if (this.dirtyCheck(inputs, lastInputs, this.lastOutput)) {
        this.particle.inputs = {...this.meta?.staticInputs, ...inputs};
        this.fire('inputs-changed');
      } else {
        this.log('inputs are uninteresting, skipping update');
      }
    }
  }
  dirtyCheck(inputs, lastInputs, lastOutput) {
    const dirtyBits = ([n, v]) =>
      (lastOutput?.[n] && !deepEqual(lastOutput[n], v))
      || !deepEqual(lastInputs?.[n], v);
    return !lastInputs
      || entries(inputs).some(dirtyBits);
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
