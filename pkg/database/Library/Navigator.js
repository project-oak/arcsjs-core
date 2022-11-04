/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

async update({records, event, props}, state, {service}) {
  state.total = records?.length;
  if (event) {
    const index = records.findIndex(({id}) => event.record.id === id);
    state.current = index >= 0 ? index : NaN;
  } else if (records?.length === 0) {
    return await this.makeNew({props}, state, service);
  } else {
    state.current = 0;
    return this.updateSelected(records, state);
  }
},

updateSelected(records, {current}) {
  return {
    event: {
      type: 'view',
      record: records?.[current]
    }
  };
},

async newRecord(props, service) {
  const newRecord = {id: await service({msg: 'MakeName'})};
  keys(props).forEach(prop => newRecord[prop] = props[prop].default || '');
  return newRecord;
},

onCurrentChange({eventlet: {value}, records}, state) {
  const current = Number(value);
  if (!isNaN(current) && current >= 0 && current < records?.length) {
    state.current = value;
    return this.updateSelected(records, state);
  }
},

async onNew(inputs, state, {service}) {
  return await this.makeNew(inputs, state, service);
},

async makeNew({props}, state, service) {
  state.current = NaN;
  const record = await this.newRecord(props, service);
  return {
    event: {type: 'new', record}
  };
},

onFirst({records}, state) {
  state.current = 0;
  return this.updateSelected(records, state);
},

onPrevious({records}, state) {
  state.current = this.normalizeCurrent(state.current - 1, state.total);
  return this.updateSelected(records, state);
},

onNext({records}, state) {
  state.current = this.normalizeCurrent(state.current + 1, state.total);
  return this.updateSelected(records, state);
},

onLast({records}, state) {
  state.current = state.total - 1;
  return this.updateSelected(records, state);
},

normalizeCurrent(current, total) {
  return Math.min(Math.max(current, 0), total - 1);
},

render({}, {current, total}) {
  const indexDisabled = isNaN(current);
  return {
    total,
    indices: this.renderIndices(current, total),
    indexDisabled,
    previousDisabled: !(current > 0),
    nextDisabled: !(current < (total - 1)),
  };
},

renderIndices(current, total) {
  const indices = [];
  for (let index = 0; index < total; ++index) {
    indices.push({
      index,
      displayIndex: index + 1,
      isSelected: index === current
    });
  }
  return indices;
},

template: html`
  <style>
    :host {
      color: var(--theme-color-fg-1);
      background-color: var(--theme-color-bg-0);
      --mdc-icon-button-size: 24px;
      --mdc-icon-size: 16px;
      height: 50px;
      vertical-align: center;
      ${globalThis.themeRules}
    }
    [current] {
      width: 40px;
    }
    span {
      padding: 0px 5px;
    }
  </style>

<div toolbar>
  <mwc-button on-click="onNew" raised>Add</mwc-button>
  <div flex></div>
  <mwc-icon-button icon="first_page" on-click="onFirst" disabled="{{previousDisabled}}"></mwc-icon-button>
  <mwc-icon-button icon="navigate_before" on-click="onPrevious" disabled="{{previousDisabled}}"></mwc-icon-button>
  <select current title="index" repeat="index_t" disabled="{{indexDisabled}}" on-change="onCurrentChange">{{indices}}</select>
  <span> of </span>
  <span>{{total}}</span>
  <mwc-icon-button icon="navigate_next" on-click="onNext" disabled="{{nextDisabled}}"></mwc-icon-button>
  <mwc-icon-button icon="last_page" on-click="onLast" disabled="{{nextDisabled}}"></mwc-icon-button>
</div>


<template index_t>
  <option selected="{{isSelected}}" value="{{index}}">{{displayIndex}}</option>
</template>

`
});
