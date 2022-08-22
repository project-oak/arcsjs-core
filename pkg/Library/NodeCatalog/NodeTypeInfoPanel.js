/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
render({nodeType}) {
  if (nodeType) {
    const {inputs, outputs} = this.retrieveInputsAndOutputs(nodeType);
    const description = nodeType?.$meta?.description || '';
    const showDescription = Boolean(description);
    const showInputs = inputs.length > 0;
    const showOutputs = outputs.length > 0;
    return {
      showDescription: String(showDescription),
      description,
      showInputs: String(showInputs),
      inputs,
      showOutputs: String(showOutputs),
      outputs,
      showNoInfoMessage: String(Boolean(!showDescription && !showInputs && !showOutputs))
    };
  }
},

retrieveInputsAndOutputs(nodeType) {
  const inputs = [];
  const outputs = [];
  this.getParticleNames(nodeType).map(name => {
    inputs.push(...this.retrieveBindings(nodeType[name].$inputs, nodeType));
    outputs.push(...this.retrieveBindings(nodeType[name].$outputs, nodeType));
  });
  return {inputs, outputs};
},

getParticleNames(nodeType) {
  const notKeyword = name => !name.startsWith('$');
  return nodeType && keys(nodeType).filter(notKeyword);
},

retrieveBindings(bindings, nodeType) {
  return (bindings || [])
    .map(value => {
      const {key, binding} = this.decodeBinding(value);
      const store = nodeType.$stores[binding];
      if (store && !store.nodisplay) {
        let type = store.$type;
        if (store.multiple) {
          type += ' (multiple)';
        }
        return {name: key, binding, type};
      }
    }).filter(binding => !!binding);
},

decodeBinding(value) {
  if (typeof value === 'string') {
    return {key: value, binding: value};
  } else {
    const [key, binding] = entries(value)[0];
    return {key, binding};
  }
},

template: html`
  <style>
    [panel] {
      color: #3c4043;
      font-size: 12px;
    }
    [description] {
      margin-bottom: 16px;
      white-space: break-spaces;
    }
    [io] {
      line-height: 18px;
    }
    [label] {
      font-weight: 500;
      padding-right: 4px;
      vertical-align: top;
      width: 60px;
    }
    [name] {
      padding-right: 4px;
    }
    [type] {
      color: #aaa;
    }
    [inputs][outputs="true"] {
      margin-bottom: 8px;
    }
  </style>

  <div panel>
    <div description display$="{{showDescription}}">{{description}}</div>
    <div columns inputs outputs$="{{showOutputs}}" display$="{{showInputs}}">
      <div io label>Inputs:</div>
      <div io name repeat="io_name">{{inputs}}</div>
      <div io type repeat="io_type">{{inputs}}</div>
    </div>
    <div columns display$="{{showOutputs}}">
      <div io label>Outputs:</div>
      <div io name repeat="io_name">{{outputs}}</div>
      <div io type repeat="io_type">{{outputs}}</div>
    </div>
    <div io display$="{{showNoInfoMessage}}">No information available.</div>
  </div>

  <template io_name>
    <div>{{name}}</div>
  </template>
  <template io_type>
    <div>{{type}}</div>
  </template>
`
});
