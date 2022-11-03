/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
update({records}, state) {
  state.pets = this.renderPets(records);
},

renderPets(pets) {
  return pets.map(pet => ({
    ...pet,
    showImage: String(Boolean(pet.image)),
    showIcon: String(!pet.image)
  }));
},

onDelete({eventlet: {key}, records}, state) {
  log(`Deleted ${key}`);
  const newRecords = records.filter(r => r.name !== key);
  state.pets = this.renderPets(newRecords);
  return {records: newRecords};
},

render({}, {pets}) {
  return {pets};
},
  
template: html`
  <style>
    :host {
      color: var(--theme-color-fg-1);
      background-color: var(--theme-color-bg-0);
      --mdc-icon-button-size: 24px;
      --mdc-icon-size: 16px;
      padding: 20px;
      ${globalThis.themeRules}
    }
    [cell] {
      text-align: center;
      border: 1px dotted var(--theme-color-fg-2);
      padding: 10px;
      width: 200px;
    }
    [button-cell] {
      padding: 10px;
    }
    [frame="new"] {
      border: 1px solid pink;
      /* height: 1000px; */
    }
    img {
      height: 50px;
      width: 70px;
      object-fit: cover;
    }
  </style>
  <div repeat="pet_t">{{pets}}</div>
  <div frame="new"></div>

  <template pet_t>
    <div flex columns>
      <div cell>{{name}}</div>
      <div cell>{{kind}}</div>
      <div cell>{{age}}</div>
      <div cell>
        <img src="{{image}}" display$="{{showImage}}">
        <mwc-icon-button icon="pets" display$="{{showIcon}}"></mwc-icon-button>
      </div>
      <div button-cell>
        <mwc-icon-button icon="delete" key="{{name}}" on-click="onDelete"></mwc-icon-button>
      </div>
    </div>
  </template>
`
});