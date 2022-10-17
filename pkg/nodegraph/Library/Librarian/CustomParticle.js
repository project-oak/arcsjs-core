/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

async onCodeChanged({eventlet: {key, value}, pipeline, nodeId}) {
  const custom = this.requireCustom(pipeline, nodeId);
  custom[key] = value;
  return {pipeline};
},

onSpecChanged({eventlet: {value}, pipeline, nodeId}) {
  const custom = this.requireCustom(pipeline, nodeId);
  try {
    const spec = JSON.parse(value);
    if (spec.$meta) {
      assign(spec.$meta, {id: nodeId, category: 'Custom', custom: true});
    }
    custom.spec = spec;
  } catch (e) {
    log(`Failed parsing spec with error ${e}`);
  }
  return {pipeline};
},

requireCustom(pipeline, nodeId) {
  pipeline.custom ??= {};
  pipeline.custom[nodeId] ??= {};
  return pipeline.custom[nodeId];
},

async onUpdate() {},

render({pipeline, nodeId}) {
  if (pipeline?.custom?.[nodeId]) {
    return this.renderCustom(pipeline.custom[nodeId]);
  }
},

renderCustom({html, js, spec}) {
  return {
    html,
    js,
    specStr: JSON.stringify(spec, null, 2)
  };
},

template: html`
<style>
  :host {
    font-size: 0.75em;
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
  [full] {
    height: 100%;
  }
</style>

<div full>
  <div bar>
    <div flex></div>
    <mwc-button raised on-click="onUpdate">Update</mwc-button>
  </div>
  <mxc-tab-pages flex full tabs="Html, Js, Meta">
    <code-mirror flex text="{{html}}" key="html" on-code-blur="onCodeChanged"></code-mirror>
    <code-mirror flex text="{{js}}" key="js" on-code-blur="onCodeChanged"></code-mirror>
    <code-mirror flex text="{{specStr}}" on-code-blur="onSpecChanged"></code-mirror>
  </mxc-tab-pages>
</div>
`
});
