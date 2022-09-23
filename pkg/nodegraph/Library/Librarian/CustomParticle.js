/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
initialize({}, state) {
  state.particle = {code: '', html: ''};
},
async update({particle, nodeKey}, state, tools) {
  if (nodeKey && particle && !deepEqual(particle, state.particle)) {
    await this.destroyParticle(state, tools);
    await this.addParticle(nodeKey, particle, state, tools);
    state.particle = particle;
  }
},
onChanged({eventlet: {key, value}, particle}) {
  return {particle: {...particle, [key]: value}};
},
render({}, state) {
  return state.particle;
},
async destroyParticle({particleName: name}, {service}) {
  if (name) {
    return service({msg: 'destroyParticle', data: {name}});
  }
},
async addParticle(nodeKey, particle, state, {service}) {
  const name = await service({msg: 'makeName'});
  const code = this.packageParticleSource(particle);
  const meta = {
    ...this.getMeta(particle),
    kind: name,
    container: `${nodeKey}customParticle#canvas`
  };
  state.particleName = name;
  return service({msg: 'addParticle', data: {name, meta, code}});
},
getMeta(props) {
  try {
    const userMeta = JSON.parse(`{${props.meta}}`);
    return (typeof userMeta === 'object') ? {...userMeta} : null;
  } catch(x) {
    // warn user somehow
  }
  return null;
},

packageParticleSource(props) {
  if (props) {
    const {code, html} = props;
    return `({
      ${code ? `${code},` : ''}
      ${html ? `template: html\`${html}\`` : ''}
    });`;
  }
},

template: html`
<style>
  :host {
    font-size: 0.75em;
    flex: none !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 5px;
    border: 1px solid gray;
    /* padding: 2px; */
    margin: 4px;
    width: 320px;
    height: 240px;
    --mdc-icon-button-size: 24px;
    --mdc-icon-size: 12px;
    --mdc-tab-height: 24px;
    --mdc-typography-button-font-size: 0.875em;
    background: #eee;
  }
  mxc-tab-pages {
    background: #fff;
  }
  [toolbar] {
    color: #fafafa;
    background: #edaf22;
    padding: 0 0 2px 6px;
  }
</style>
<mxc-tab-pages flex tabs="Preview, Html, Js, Meta">
  <div flex frame="canvas"></div>
  <code-mirror flex text="{{html}}" key="html" on-code-blur="onChanged"></code-mirror>
  <code-mirror flex text="{{code}}" key="code" on-code-blur="onChanged"></code-mirror>
  <code-mirror flex text="{{meta}}" key="meta" on-code-blur="onChanged"></code-mirror>
</mxc-tab-pages>
`
});
