/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const particle = () => {

const colorScheme = 'color-scheme';

const template = html`
<style>
  :host {
    flex: 1;
    display: block;
    background-color: var(--theme-color-6);
    height: 100%;
  }
  * {
    box-sizing: border-box;
  }
  :host [scrolling] {
    ${colorScheme}: dark;
  }
  [grid] {
    padding: 6px;
  }
  [grid] > * {
    margin-bottom: 20px;
  }
  [sleeve] {
    background-color: var(--theme-color-4);
    width: 120px;
    height: 120px;
    margin: 6px 8px;
    border-width: 6px;
    border-color: var(--theme-color-6);
    border-radius: 1.5rem;
    border-style: solid;
    /* opacity: 0.8; */
  }
  /* [sleeve][selected] {
    border-color: var(--theme-color-9);
    opacity: 1;
  } */
  [card] {
    padding: 8px 5px;
    cursor: pointer;
    color: var(--theme-color-9);
    white-space: nowrap;
  }
  sl-icon {
    width: 100%;
    height: 100%;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  [name] {
    overflow: hidden;
    white-space: pre-wrap;
    text-align: center;
  }
  [desc] {
    color: var(--theme-color-8);
    font-size: 0.7rem;
  }
  [text] {
    padding: 10px;
  }
</style>

<div flex center scrolling grid repeat="actionT">{{items}}</div>

<template actionT>
  <div centered sleeve selected$="{{selected}}" rows>
    <div flex card rows key="{{key}}" on-click="onSelectDevice">
      <div flex frame rows>
        <sl-icon hidden="{{hideIcon}}" name="{{icon}}"></sl-icon>
        <img hidden="{{hidePreview}}" target="phone" href="{{href}}" src="{{preview}}">
      </div>
      <div text center rows>
        <div name>{{name}}</div>
        <div desc>{{description}}</div>
      </div>
    </div>
  </div>
</template>
`;

return {
  get template() {
    return template;
  },
  async update({actionId, actionsPrivate, actionsDefault, actionsAggregate}, state) {
    if (state.actionId !== actionId) {
      Object.assign(state, {
        actionId,
        action: [...actionsPrivate, ...actionsDefault, ...actionsAggregate].find(({meta}) => meta.id === actionId)
      });
    }
  },
  render({}, {action}) {
    const devices = [{
      name: 'Wearables',
      icon: 'person',
      key: 'wearables'
    }, {
      name: 'SmartWatch',
      icon: 'watch',
      key: 'watch'
    }, {
      name: 'SmartScreen',
      icon: 'fullscreen',
      key: 'smartscreen'
    }, {
      name: 'SmartPhone',
      //icon: 'phone',
      preview: './Library/RedOwl/assets/qrcode.png',
      href: 'https://rapsai-core.web.app/runner'
    }, {
      name: 'AR/VR',
      icon: 'headset-vr',
      key: 'arvr'
    }, {
      name: 'SmartThing',
      icon: 'lightbulb',
      key: 'arvr'
    }];
    const actionDevices = new Set(action?.recipes.map(r => r.$meta.devices).flat().filter(d => Boolean(d)));
    const items = devices?.map(item => ({
      ...item,
      hideIcon: !item.icon,
      hidePreview: !item.preview,
      selected: actionDevices.has(item.key)
    }));
    return {items};
  },
  async onSelectDevice({eventlet: {key}}, state, {service}) {
    if (key) {
      await service({msg: 'request-surface', name: key});
    }
  }
};

};
