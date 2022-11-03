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
  state.props = ['name', 'kind', 'age', 'image'];
},

update({records}, state) {
  state.pets = records;
  if (!state.newPet) {
    state.newPet = this.newPet(state.props);
  }
},

render({}, {newPet, error}) {
  return {
    ...newPet,
    error
  };
},

onChange({eventlet: {key, value}}, state) {
  state.newPet[key] = value;
  assign(state.newPet, this.renderImageProps(state.newPet.image));
  if (state.error) {
    this.verifyNewPet(state);
  }
},

onSave({records}, state) {
  if (this.verifyNewPet(state)) {
    records.push(state.newPet);
    state.newPet = this.newPet(state.props);
    return {records};
  }
},

verifyNewPet(state) {
  const missingProps = state.props.filter(prop => !state.newPet[prop]);
  const isValid = missingProps.length === 0;
  state.error = isValid
    ? null
    : `Missing properties: ['${missingProps.join('\', \'')}']`;
  return isValid;
},

newPet(props) {
  const newPet = {};
  props.forEach(prop => newPet[prop] = '');
  assign(newPet, this.renderImageProps(''));
  return newPet;
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
      border: 10px solid lightpink;
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

<div toolbar>
  <div flex error>{{error}}</div>
  <mwc-button on-click="onSave" raised>Add Pet</mwc-button>
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
`
});
