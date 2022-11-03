/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

update({event}, state) {
  if (event) {
    if (this.recordChanged(event, state)) {
      delete state.error;
    }
    const {type, record} = event;
    assign(state, {pet: record, isNew: type === 'new'};
    if (state.pet) {
      assign(state.pet, this.renderImageProps(state.pet.image));
    }
  }
},

recordChanged({record}, {pet}) {
  return record?.id !== pet?.id;
},

render({}, {pet, error, isNew}) {
  return {
    ...pet,
    error,
    formStyle: isNew ? {border: '10px solid lightpink'} : ''
  };
},

onChange({eventlet: {key, value}, props}, state) {
  state.pet[key] = value;
  assign(state.pet, this.renderImageProps(state.pet.image));
  if (state.error) {
    this.verifyPet(props, state);
  }
},

onSave({props}, state) {
  if (this.verifyPet(props, state)) {
    return {
      modifyRecordEvent: {
        type: 'save',
        record: state.pet
      }
    };
  }
},

onDelete({}, {pet}) {
  return {
    event: {type: 'delete', record: pet}
  };
},

verifyPet(props, state) {
  const missingProps = keys(props).filter(prop => props[prop].mandatory && !state.pet[prop]);
  const isValid = missingProps.length === 0;
  // TODO(mariakleiner): also verify if properties have valid values (min, max, etc).
  state.error = isValid
    ? null
    : `Missing properties: ['${missingProps.join('\', \'')}']`;
  return isValid;
},

renderImageProps(image) {
  return {
    showImage: String(Boolean(image)),
    showIcon: String(Boolean(!image))
  };
},
  
template: html`
  <style>
    :host {
      color: var(--theme-color-fg-1);
      background-color: var(--theme-color-bg-0);
      --mdc-icon-button-size: 24px;
      --mdc-icon-size: 16px;
      ${globalThis.themeRules}
    }
    [label] {
      font-weight: bold;
    }
    [field] {
      padding: 10px;
    }
    img {
      height: 40px;
      width: 60px;
      object-fit: cover;
    }
    [error] {
      color: red;
      font-weight: bold;
    }
  </style>

<div xen:style="{{formStyle}}">
<div toolbar>
  <div flex error>{{error}}</div>
  <mwc-icon-button icon="done" on-click="onSave"></mwc-icon-button>
  <mwc-icon-button icon="close" on-click="onDelete"></mwc-icon-button>
</div>

<div columns>
  <div flex field>
    <div label>name</div>
    <input type="text" key="name" value="{{name}}" on-change="onChange">
  </div>
  <div flex field>
    <div label>kind</div>
    <input type="text" key="kind" value="{{kind}}" on-change="onChange">
  </div>
  <div flex field>
    <div label>age</div>
    <input type="text" key="age" value="{{age}}" on-change="onChange">
  </div>
</div>
<div columns>
  <div flex field>
    <div label>image</div>
    <img src="{{image}}" display$="{{showImage}}">
    <mwc-icon-button icon="pets" display$="{{showIcon}}"></mwc-icon-button>
    <image-upload on-image="onChange" key="image">
      <mwc-button>Upload</mwc-button>
    </image-upload>
  </div>
  <span flex></span>
  <span flex></span>
</div>
</div>
`
});
