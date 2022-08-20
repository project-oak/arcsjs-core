/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

async update({data}, state, {output}) {
  if (this.dataPropsChanged(data, state)) {
    await this.refreshRendering(state, output);
    state.data = data;
  }
},

dataPropsChanged(data, {data: oldData}) {
  return data?.title !== oldData?.title ||
    data?.props?.length !== oldData?.props?.length ||
    data?.props?.some(({name}, index) => name !== oldData?.props?.[index].name);
},

async refreshRendering(state, output) {
  // clear out rendered flyweight data
  state.shouldClear = true;
  // render on output
  await output({});
  // next time render normally
  state.shouldClear = false;
  // render on return
},

render({data, customInspectors}, state) {
  if (state.shouldClear) {
    return {title: '', props: []};
  }
  let title = data?.title || '\\o/';
  return {
    showNothingToInspect: String(data == null),
    title,
    showDelete: String(Boolean(data?.props)),
    props: this.renderProps(data, customInspectors, state)
  };
},

renderProps(data, customInspectors, state) {
  return data?.props
    ?.filter(prop => !prop.store.noinspect)
    ?.map(prop => this.renderProp(prop, undefined, customInspectors, state));
},

renderProp(prop, parent, customInspectors, state) {
  const key = `${parent ? `${parent}:` : ''}${prop.name}`;
  const $template = this.chooseTemplate(prop, state.editedKey === key, customInspectors);
  const model = this.constructPropModel(key, prop, parent, $template, state);
  return {
    prop: {
      $template,
      models: [model]
    }
  };
},

chooseTemplate({store: {$type, values, range}, value}, isEditing, customInspectors) {
  let template = {
    Boolean: 'checkbox_t',
    String: 'text_t',
    Number: 'text_t',
    Image: 'imageupload_t',
   ['[Image]']: 'batchimageupload_t',
    //number: 'range_t',
    number: 'text_t',
    string: 'text_t',
    boolean: 'checkbox_t',
    Select: 'select_t',
  }[$type] ?? 'unimpl_t';

  if (customInspectors?.[$type]) {
    template = 'custom_t';
  } else if ($type === 'Number' && ['min', 'max', 'step'].every(key => keys(range || {}).some(k => k === key))) {
    template = 'range_t';
  } else if (['unimpl_t', 'text_t'].includes(template)) {
    if (Array.isArray(values)) {
      template = 'select_t';
    } else if (typeof value === 'object') {
      template = isEditing ? 'object_editor_t' : 'object_t';
    } else {
      template = 'text_t';
    }
  }
  return template;
},

constructPropModel(key, prop, parent, template, state) {
  const {name, propId, store: {$type, values, range, multiple}, value, displayName} = prop;
  let model = {
    name,
    key,
    displayName: displayName || name,
    type: $type,
    value
  };
  switch (template) {
    case 'select_t': {
      const selected = model.value;
      model.value = values.map(v => {
        if (typeof v !== 'object') {
          v = {key: v, name: v};
        }
        return {
          ...v,
          selected: selected && Array.isArray(selected) ? selected?.includes(v.key) : selected === v.key
        };
      });
      model.disabled = model.value?.length === 0;
      model.multiple = multiple;
      model.value.splice(0, 0, {key: '', name: '', selected: !model.value.some(v => v.selected)});
      break;
    }
    case 'range_t': {
      const {min, max, step} = range;
      model = {...model, min, max, step, value: model.value || min};
      break;
    }
    case 'object_editor_t': {
      state.editedKey = model.key;
      model.value = JSON.stringify(model.value);
      break;
    }
    case 'object_t': {
      model.displayName = `${parent ? `${parent}:` : ''}${model.displayName}`;
      if (Array.isArray(model.value)) {
        model.props = [{
          prop: {
            $template: 'list_t',
            models: [{
              key: model.key,
              props: entries(model.value).map(
                ([index, value]) => ({
                  ...this.renderSubProp(model.displayName, {name: index, value}, state),
                  listKey: model.key,
                  itemKey: `${model.key}:${index}`
                })
              )
            }]
          }
        }];
      } else {
        model.props = entries(model.value).map(
          ([name, value]) => this.renderSubProp(model.displayName, {name, value}, state)
        );
      }
      break;
    }
    case 'custom_t': {
      model.container = `custom${propId}`;
      break;
    }
    case 'text_t': {
      model.value = model.value ?? '';
      break;
    }
  }
  return model;
},

renderSubProp(parent, {name, value}, state) {
  const type = typeof value;
  return this.renderProp({name, store: {$type: type}, value}, parent, {}, state);
},

onPropChange({eventlet: {key, value}, data}) {
  const propNames = key.split(':');
  const formatter = (propValue, propType) => this.formatPropValueByType(propValue, propType, value);
  return this.updatePropValue(data, propNames, formatter);
},

onAddItem({eventlet: {key, value}, data}) {
  const propNames = key.split(':');
  const formatter = (propValue, propType) => [...propValue, this.makeNewItem(value, propType)];
  return this.updatePropValue(data, propNames, formatter);
},

makeNewItem(value, propType) {
  if (propType === '[Image]') {
    return {src: value || ''};
  } else if (propType === '[String]') {
    return '';
  } else if (propType === '[JSON]') {
    return {};
  }
},

onRemoveItem({eventlet: {key}, data}, state) {
  assign(state, {editedKey: null});
  const propNames = key.split(':');
  // TODO(mariakleiner): currently list add/remove is only support for top level props.
  const index = propNames.splice(1, 1)[0];
  const formatter = (propValue) => propValue.filter((_, i) => i !== Number(index));
  return this.updatePropValue(data, propNames, formatter);
},

async onEditObject({eventlet: {key}}, state, {output}) {
  assign(state, {editedKey: key});
  return this.refreshRendering(state, output);
},

async onEditObjectChange({eventlet: {key, value}, data}, state, {output}) {
  assign(state, {editedKey: null});
  await this.refreshRendering(state, output);
  const propNames = key.split(':');
  const formatter = (propValue, propType) => {
    try {
      return JSON.parse(value);
    } catch(e) { log(`Invalid JSON: ${value}`); }
    return (/\[.*\]/.test(propType) ? [] : {});
  };
  return this.updatePropValue(data, propNames, formatter);
},

updatePropValue(data, propNames, formatter) {
  const propName = propNames.shift();
  const prop = data.props.find(p => p.name === propName);
  const newValue = this.formatNewValue(prop.value, prop.store.$type, propNames, formatter);
  return this.setValueInProps(data, prop, newValue);
},

setValueInProps(data, prop, newValue) {
  const index = data.props.findIndex(p => p.name === prop.name);
  data.props = assign([], data.props, {[index]: {...prop, value: newValue}});
  return {data};
},

formatNewValue(currentValue, currentType, propNames, formatter) {
  let cursor = currentValue;
  propNames.forEach(prop => cursor = cursor?.[prop]);
  const newValue = formatter(cursor, propNames.length > 0 ? '': currentType);
  return propNames?.length ? this.setNestedValue(currentValue, propNames, newValue) : newValue;
},

setNestedValue(value, propNames, propValue) {
  const newValue = this.cloneValue(value);
  let cursor = newValue;
  const lastProp = propNames.pop();
  propNames.forEach(prop => {
    if (cursor[prop]) {
      cursor[prop] = {...cursor[[prop]]};
    } else {
      cursor[prop] = {};
    }
    cursor = cursor[prop];
  });
  cursor[lastProp] = propValue;
  return newValue;
},

cloneValue(value) {
  return Array.isArray(value) ? [...value] : {...value};
},

formatPropValueByType(currentValue, currentType, newValue) {
  if (typeof currentValue === 'boolean') {
    return !currentValue;
  } else if ((typeof currentValue === 'number') || currentType === 'Number') {
    return Number(newValue);
  } else if (Array.isArray(currentValue)) {
    return Array.isArray(newValue) ? newValue : (newValue ? [newValue] : []);
  } else if (typeof currentValue === 'object' && keys(currentValue)?.length === 1) {
    return {[keys(currentValue)[0]]: newValue};
  } else if (!newValue) {
    return undefined;
  }
  return newValue;
},

onDelete({data}) {
  return {data: {key: data.key, shouldDelete: true}};
},

template: html`
<style>
  :host {
    height: 100%;
    width: 280px;
    white-space: nowrap;
    background-color: var(--theme-color-bg-0);
    color: var(--them-color-fg-4);
    position: relative;
    overflow-y: auto;
  }
  [info-container] {
    border-bottom: 1px solid var(--theme-color-bg-3);
    color: #3c4043;
    padding: 8px 16px 16px;
  }
  [title-container] {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 8px 0;
  }
  [title] {
    font-weight: bold;
    font-size: 14px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-transform: capitalize;
  }
  [title][properties] {
    color: #3c4043;
    padding: 16px 0 0 16px;
    flex-shrink: 0;
  }
  [prop-container] {
    display: flex;
    align-items: center;
    font-size: 14px;
    padding-bottom: 16px;
  }
  [prop-container][vertical] {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
  }
  [prop-container][object] {
    padding-bottom: 2px;
  }
  [controls] {
    font-size: 12px;
    padding: 16px;
  }
  [controls] img {
    border: 1px dotted var(--theme-color-bg-2);
    margin-right: 8px;
    width: 3em;
    height: 3em;
    object-fit: contain;
  }
  sl-range {
    padding: 0 6px;
    --thumb-size: 10px;
    --track-height: 2px;
    --sl-input-label-font-size-medium: 9px;
  }
  sl-range::part(input) {
    height: 17px;
  }
  input[type="text"] {
    width: 100%;
    height: 24px;
    border: 1px solid var(--theme-color-fg-0);
    border-radius: 4px;
  }
  input[type="checkbox"] {
    margin-left: 0;
    margin-right: 8px;
  }
  [buttons] {
    padding: 12px;
  }
  [select] {
    width: 100%;
  }
  [subprop] {
    border-top: 1px dotted var(--theme-color-5);
    padding: 8px 0 0 16px;
  }
  [subprop] [subprop]:first-child {
    border-top: none;
  }
  [label] {
    font-size: 13px;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    color: var(--theme-color-fg-2);
    text-transform: capitalize;
  }
  [label][control] {
    margin-bottom: 4px;
  }
  [bar] > *:first-child {
    width: 72px;
    text-align: right;
    font-size: 11px;
    padding-right: 8px;
    margin-right: 6px;
    color: var(--theme-color-fg-0);
  }
  textarea {
    width: 100%;
  }
  [noSelectionMsg] {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #777;
    background-color: var(--theme-color-bg-0);
    font-size: 13px;
  }
</style>

<div info-container>
  <div title-container>
    <div title>{{title}}</div>
    <mwc-icon-button on-click="onDelete" icon="delete" display$="{{showDelete}}"></mwc-icon-button>
  </div>
  <div frame="info"></div>
</div>
<div title properties>Properties</div>
<div controls repeat="prop_t">{{props}}</div>
<div noSelectionMsg display$="{{showNothingToInspect}}">Nothing to inspect</div>

<template prop_t>
  <div prop>{{prop}}</div>
</template>

<template unimpl_t>
  <div hidden bar>
    <span label flex>{{displayName}}</span>
    <input type="text" disabled key="{{key}}" value="not yet implemented">
  </div>
</template>

<template object_t>
  <div>
    <div prop-container object>
      <span label>{{displayName}}</span>
      <mwc-icon-button on-click="onEditObject" key="{{key}}" icon="edit"></mwc-icon-button>
    </div>
    <div subprop repeat="prop_t">{{props}}</div>
  </div>
</template>

<template object_editor_t>
  <div prop-container vertical>
    <div label control>Enter plain JSON:</div>
    <textarea key="{{key}}" on-blur="onEditObjectChange">{{value}}</textarea>
  </div>
</template>

<template list_t>
  <div>
    <div subprop repeat="list_prop_t">{{props}}</div>
    <mwc-button key="{{key}}" on-click="onAddItem">Add</mwc-button>
  </div>
</template>

<template list_prop_t>
  <div bar>
    <div flex prop>{{prop}}</div>
    <mwc-icon-button on-click="onRemoveItem" key="{{itemKey}}" icon="delete"></mwc-icon-button>
  </div>
</template>

<template batchimageupload_t>
  <div>
    <div bar>
      <image-upload on-image="onAddItem" key="{{key}}" multiple="true">
        <mwc-button>Upload</mwc-button>
      </image-upload>
      <mwc-button key="{{key}}" on-click="onAddItem">Add</mwc-button>
    </div>
    <div repeat="imagepreview_t">{{value}}</div>
  </div>
</template>

<template imagepreview_t>
  <div bar>
    <img src="{{src}}">
    <input type="text" value="{{src}}" on-blur="onPropChange" key="{{itemKey}}"/>
    <mwc-icon-button on-click="onRemoveItem" key="{{itemKey}}" icon="delete"></mwc-icon-button>
  </div>
</template>

<template imageupload_t>
  <div prop-container>
    <img src="{{value}}">
    <image-upload on-image="onPropChange" key="{{key}}">
      <mwc-button>Upload</mwc-button>
    </image-upload>
  </div>
</template>

<!-- <template range_t>
  <div>
    <sl-range
      label="{{displayName}}"
      min="{{min}}"
      max="{{max}}"
      step="{{step}}"
      value="{{value}}"
      key="{{key}}"
      on-sl-change="onPropChange">
    </sl-range>
  </div>
</template> -->

<template range_t>
  <div bar>
    <div label flex>{{displayName}}</div>
    <input type="range" key="{{key}}" value="{{value}}" min="{{min}}" max="{{max}}" step="{{step}}" on-input="onPropChange">
  </div>
</template>

<template checkbox_t>
  <div prop-container>
    <input type="checkbox" checked="{{value}}" key="{{key}}" on-change="onPropChange">
    <span label>{{displayName}}</span>
  </div>
</template>

<template text_t>
  <div prop-container vertical>
    <span label control>{{displayName}}</span>
    <input type="text" key="{{key}}" value="{{value}}" on-change="onPropChange">
  </div>
</template>

<template select_t>
  <div prop-container vertical>
    <div label control>{{displayName}}</div>
    <multi-select select key="{{key}}" disabled$="{{disabled}}" on-change="onPropChange" multiple="{{multiple}}" options="{{value}}"></multi-select>
  </div>
</template>

<template custom_t>
  <div flex prop-container frame$="{{container}}"></div>
</template>
`
});
