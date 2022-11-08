/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

async update(inputs, state, {service}) {
  const {records, selectedRecord} = inputs;
  state.total = records?.length;
  if (records?.length === 0) {
    return this.makeNew(inputs, state, service);
  } else {
    state.current = records.findIndex(({id}) => id === selectedRecord?.id);
    if (state.current >= 0) {
      if (this.selectedRecordUpdated(selectedRecord, records[state.current])) {
        records[state.current] = selectedRecord;
        return {records};
      }
    }
  }
},

selectedRecordUpdated(selectedRecord, previousSelected) {
  return (selectedRecord?.id === previousSelected?.id)
    && !deepEqual(selectedRecord, previousSelected);
}, 

updateSelected(records, {current}) {
  return {selectedRecord: records[current]};
},

async newRecord(props, service) {
  const newRecord = {id: await service({msg: 'MakeName'})};
  keys(props).forEach(prop => newRecord[prop] = props[prop].default || '');
  return newRecord;
},

onCurrentChange({eventlet: {value}, records}, state) {
  const current = Number(value);
  if (current >= 0 && current < records?.length) {
    state.current = value;
    return this.updateSelected(records, state);
  }
},

async onNew(inputs, state, {service}) {
  return this.makeNew(inputs, state, service);
},

onDelete({records, selectedRecord, selectedRecordIds}, {current}) {
  if (selectedRecord) {
    records.splice(current, 1);
  } else {
    records = records.filter(({id}) => !selectedRecordIds?.find(selected => id === selected));
  }
  return {
    records,
    selectedRecord: null
  };
},

async makeNew({props, records}, state, service) {
  const record = await this.newRecord(props, service);
  records.push(record);
  state.current = records.length - 1;
  return {
    records,
    selectedRecord: record
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

onBack() {
  return {selectedRecord: null};
},

normalizeCurrent(current, total) {
  return Math.min(Math.max(current, 0), total - 1);
},

render({selectedRecord, selectedRecordIds}, {current, total}) {
  const indexDisabled = !(total > 1);
  const showNav = String(Boolean(selectedRecord));
  const deleteDisabled = Boolean(!selectedRecord && !(selectedRecordIds?.length > 0));
  return {
    total,
    indices: this.renderIndices(current, total),
    indexDisabled,
    previousDisabled: !(current > 0),
    nextDisabled: !(current < (total - 1)),
    showNav,
    deleteDisabled
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
  <mwc-icon-button  on-click="onBack" icon="arrow_back" display$="{{showNav}}"></mwc-icon-button>
  <mwc-button on-click="onNew" raised>Add</mwc-button>
  <mwc-button on-click="onDelete" disabled="{{deleteDisabled}}">Delete</mwc-button>
  <div flex></div>
  <div display$="{{showNav}}">
    <mwc-icon-button icon="first_page" on-click="onFirst" disabled="{{previousDisabled}}"></mwc-icon-button>
    <mwc-icon-button icon="navigate_before" on-click="onPrevious" disabled="{{previousDisabled}}"></mwc-icon-button>
    <select current title="index" repeat="index_t" disabled="{{indexDisabled}}" on-change="onCurrentChange">{{indices}}</select>
    <span> of </span>
    <span>{{total}}</span>
    <mwc-icon-button icon="navigate_next" on-click="onNext" disabled="{{nextDisabled}}"></mwc-icon-button>
    <mwc-icon-button icon="last_page" on-click="onLast" disabled="{{nextDisabled}}"></mwc-icon-button>
  </div>
</div>


<template index_t>
  <option selected="{{isSelected}}" value="{{index}}">{{displayIndex}}</option>
</template>

`
});
