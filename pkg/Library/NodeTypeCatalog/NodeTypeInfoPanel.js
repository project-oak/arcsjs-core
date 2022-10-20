/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
render({nodeType, categories}) {
  if (nodeType) {
    const {inputs, outputs} = this.retrieveInputsAndOutputs(nodeType);
    const {description, displayName, id} = nodeType.$meta;
    const title = description || displayName || id;
    const showTitle = Boolean(title);
    const showInputs = inputs.length > 0;
    const showOutputs = outputs.length > 0;
    return {
      showTitle,
      title,
      style: this.styleByCategory(nodeType.$meta.category, categories),
      showInputs: String(showInputs),
      inputs,
      showOutputs: String(showOutputs),
      outputs
    };
  }
},

styleByCategory(category, categories) {
  const color = this.colorByCategory(category, categories);
  const backgroundColor = this.bgColorByCategory(category, categories);
  return {
    backgroundColor,
    borderBottom: `1px solid ${color}`
  };
},

colorByCategory(category, categories) {
  return categories?.[category]?.color || 'crimson';
},

bgColorByCategory(category, categories) {
  return categories?.[category]?.bgColor || 'lightgrey';
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
    [title] {
      white-space: break-spaces;
      padding: 20px;
    }
    [info] {
      padding: 12px;
    }
    [io] {
      line-height: 18px;
    }
    [label] {
      font-weight: bold; 
      /* 500; */
      padding-right: 4px;
      vertical-align: top;
      width: 60px;
    }
    [name] {
      padding-right: 50px;
    }
    [type] {
      color: #aaa;
    }
    [inputs][outputs="true"] {
      margin-bottom: 8px;
    }
  </style>

  <div panel>
    <div title display$="{{showTitle}}" xen:style="{{style}}">{{title}}</div>
    <div info>
      <div io label display$="{{showInputs}}">Inputs</div>
      <div columns inputs outputs$="{{showOutputs}}" display$="{{showInputs}}">
        <div io name repeat="io_name">{{inputs}}</div>
        <div io type repeat="io_type">{{inputs}}</div>
      </div>
      <div io label display$="{{showOutputs}}">Outputs</div>
      <div columns display$="{{showOutputs}}">
        <div io name repeat="io_name">{{outputs}}</div>
        <div io type repeat="io_type">{{outputs}}</div>
      </div>
    </div>
  </div>

  <template io_name>
    <div>{{name}}</div>
  </template>
  <template io_type>
    <div>{{type}}</div>
  </template>
`
});
