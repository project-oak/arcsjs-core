/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
export interface Eventlet {
    handler: any;
    data: any;
}
/**
 * ParticleAPI functions are called at various points in the particle's lifecycle.
 * Developers should override these functions as needed to give a particle
 * functionality.
 */
export declare class ParticleApi {
    /**
     * Particles that render on a surface should provide a template. The template
     * can include double curly bracketed keys that will be interpolated at
     * runtime.
     *
     * To dynamically change the template, we double curly braced keys must be
     * the only thing inside a div or span:
     * ```
     * <span>{{key}}</span>.
     * <div>{{key}}</div>
     * ```
     *
     * The value for each key is returned from the {@link render | render method}.
     *
     * Double curly bracketed keys can also be placed inside div definitions to
     * change attributes. In this instance we place them inside quotation marks.
     * For example:
     * ```
     * <div class=”{{classKey}}" hidden="{{hideKey}}">
     * ```
     */
    get template(): any;
    /**
     * shouldUpdate returns a boolean that indicates if runtime should update
     * when inputs or state change.
     *
     * This function can be overwritten to implement the desired
     * behaviour.
     *
     * @param inputs
     * @param state
     *
     * @returns a boolean to indicate if updates should be allowed.
     */
    shouldUpdate(inputs: any, state: any): boolean;
    /**
     * Update is called anytime an input to the particle changes.
     *
     * This function can be overwritten to implement the desired
     * behaviour.
     *
     * Inputs are the stores the particle is bound to.
     * State is an object that can be changed and passed to sub-functions.
     * Tools allow the particle to perform supervised activities -
     * for example services are a tool.
     *
     * The update function can return an object containing the new desired
     * value(s) for the stores. For example, if we wanted to update the
     * `Person` and `Address` stores we would return:
     *
     * ```
     * return {
     *   Person: 'Jane Smith',
     *   Address: '123 Main Street'
     * };
     * ```
     *
     * @param inputs
     * @param state
     * @param tools
     *
     * @returns [OPTIONAL] object containing store to value mappings
     */
    update(inputs: any, state: any, tools: any): Promise<any>;
    /**
     * shouldRender returns a boolean that indicates if runtime should
     * render the template.
     *
     * This function can be overwritten to implement the desired
     * behaviour.
     *
     * @param inputs
     * @param state
     *
     * @returns a boolean to indicate if the template should be re-rendered.
     */
    shouldRender(inputs: any, state: any): boolean;
    /**
     * Render returns an object that contains the key: value pairings
     * that will be interpolated into the {@link template | template}.
     * For example, if the template contained keys `class`,
     * `hideDiv`, and `displayTxt` we could return:
     * ```
     * {
     *   class: 'title`,
     *   hideDiv: false,
     *   displayTxt: "My Page's Title"
     * }
     * ```
     *
     * This functions can be overwritten to return the desired
     * values.
     *
     * @param inputs
     * @param state
     */
    render(inputs: any, state: any): any;
}
export declare class Particle {
    pipe: any;
    impl: any;
    internal: any;
    constructor(proto: any, pipe: any, beStateful: any);
    get log(): any;
    get template(): any;
    get config(): {
        template: any;
    };
    set inputs(inputs: any);
    get inputs(): any;
    get state(): any;
    service(request: any): Promise<any>;
    invalidateInputs(): void;
    invalidate(): void;
    async(fn: any): Promise<void>;
    validate(): Promise<void>;
    validateInputs(): any;
    implements(methodName: any): boolean;
    maybeUpdate(): Promise<void>;
    checkInit(): Promise<boolean>;
    canUpdate(): boolean;
    shouldUpdate(inputs: any, state: any): Promise<boolean>;
    update(): void;
    outputData(data: any): void;
    maybeRender(): any;
    handleEvent({ handler, data }: {
        handler: any;
        data: any;
    }): Promise<void>;
    asyncMethod(asyncMethod: any, injections?: any): Promise<void>;
    try(asyncFunc: any): Promise<any>;
}
