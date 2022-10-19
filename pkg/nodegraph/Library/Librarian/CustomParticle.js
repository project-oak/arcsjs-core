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

onSpecChanged({eventlet: {value}, pipeline, nodeId}, state) {
  try {
    const parsed = JSON.parse(value);
    state.error = '';
    const spec = this.simplifiedToSpec(parsed, nodeId);
    if (spec) {
      const custom = this.requireCustom(pipeline, nodeId);
      custom.spec = spec;
      return {pipeline};
    }
  } catch (e) {
    state.error = `Failed parsing spec with error ${e}`;
    log(state.error);

  }
},

requireCustom(pipeline, nodeId) {
  pipeline.custom ??= {};
  pipeline.custom[nodeId] ??= {};
  return pipeline.custom[nodeId];
},

async onUpdate() {},

render({pipeline, nodeId}, state) {
  const custom = pipeline?.custom?.[nodeId];
  return {
    html: custom?.html || '',
    js: custom?.js || '',
    meta: JSON.stringify(this.specToSimplified(custom?.spec), null, 2),
    error: state.error
  };
},

specToSimplified(spec) {
  const notKeyword = name => !name.startsWith('$');
  const particle = spec?.[keys(spec).filter(notKeyword)?.[0]];
  return {
    displayName: spec?.$meta?.displayName || '',
    category: spec?.$meta?.category || 'Custom',
    $stores: spec?.$stores || {},
    $inputs: particle?.$inputs || [],
    $outputs: particle?.$outputs || []
  };
},

simplifiedToSpec({displayName, category, $stores, $inputs, $outputs}, nodeId) {
  if (displayName) {
    return {
      $meta: {
        id: nodeId,
        displayName,
        category,
        custom: true
      },
      $stores,
      particle: {
        $kind: nodeId,
        $inputs,
        $outputs
      }
    };
  }
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
  [error] {
    color: red;
    padding: 10px;
    white-space: normal;
  }
</style>

<div full>
  <div bar>
    <div flex>
      <div error>{{error}}</div>
    </div>
    <mwc-button raised on-click="onUpdate">Update</mwc-button>
  </div>
  <mxc-tab-pages flex full tabs="Html, Js, Meta">
    <code-mirror flex text="{{html}}" key="html" on-code-blur="onCodeChanged"></code-mirror>
    <code-mirror flex text="{{js}}" key="js" on-code-blur="onCodeChanged"></code-mirror>
    <code-mirror flex text="{{meta}}" on-code-blur="onSpecChanged"></code-mirror>
  </mxc-tab-pages>
</div>
`
});
