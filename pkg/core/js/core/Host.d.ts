import { EventEmitter } from './EventEmitter.js';
import { Particle, Eventlet } from './Particle.js';
import { ParticleMeta } from './types.js';
/**
 * Host owns metadata (e.g. `id`, `container`) that its Particle is not allowed to access.
 * Host knows how to talk, asynchronously, to its Particle (potentially using a bus).
**/
export declare class Host extends EventEmitter {
    arc: any;
    id: any;
    lastOutput: any;
    log: any;
    meta: ParticleMeta;
    particle: Particle;
    constructor(id: any);
    onevent(eventlet: any): void;
    installParticle(particle: Particle, meta?: ParticleMeta): void;
    get container(): string;
    detach(): void;
    protected detachParticle(): void;
    protected service(request: any): Promise<any>;
    protected output(outputModel: any, renderModel: any): void;
    protected render(model: any): void;
    set inputs(inputs: any);
    dirtyCheck(inputs: any, lastInputs: any, lastOutput: any): boolean;
    lastInputsLength(lastInputs: any): number;
    get config(): {
        template: any;
    };
    get template(): any;
    invalidate(): void;
    handleEvent(eventlet: Eventlet): Promise<void>;
}
