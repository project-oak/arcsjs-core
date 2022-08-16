/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
async initialize(inputs, state) {
  state.selectedIndex = 0;
  state.count = 0;
},
shouldUpdate({records}) {
  return Array.isArray(records);
},
async update(inputs, state, tools) {
  state.count = inputs.records?.length ?? 0;
  if (!state.count) {
    state.lastIndex = -1;
  } else if (state.lastIndex !== state.selectedIndex) {
    await this.selectRecord(inputs, state, tools);
    state.lastIndex = state.selectedIndex;
  } else {
    return await this.updateRecords(inputs, state);
  }
},
async selectRecord({records}, {selectedIndex}, {service}) {
  const record = records[selectedIndex];
  if (record) {
    log('choosing', record);
    // can use key as storeId to update a Store with value
    const updater = async ({key, value}) =>
      await service({kind: 'StoreUpdateService', msg: 'UpdateStoreValue', data: {storeId: key, value}});
    // run updater on all the records, in parallel
    const updates = entries(record).map(([key, value]) => updater({key, value}));
    // let the updates race it out
    return updates && Promise.all(updates);
  }
},
async updateRecords(inputs, {selectedIndex}) {
  const valueKeys = keys(inputs).filter(n => n.includes('value'));
  if (valueKeys.length) {
    log(valueKeys);
    const {records} = inputs;
    let record = records[selectedIndex];
    if (!record) {
      record = records[selectedIndex] = create(null);
    }
    log('got record at index', selectedIndex, record);
    valueKeys.forEach(key => {
      log(`setting key [${key}] to value [${inputs[key]}]`);
      record[key] = inputs[key];
    });
    log(record);
    return {records};
  }
},
// async listenForStoreChange({records}, state, {service, invalidate, output}) {
//   let changes;
//   do {
//     //log('wild hanging async watcher started');
//     const allChanges = await service({kind: 'StoreUpdateService', msg: 'ListenToAllChanges'});
//     changes = allChanges.filter(change => change?.storeId?.includes('value'));
//   } while (!changes?.length && !state.disposed)
//   state.listening = false;
//   //log('yahooo, storeId wild west update:', changes);
//   changes.forEach(change => this.updateFieldValue(change, records, state.selectedIndex));
//   output({records});
//   invalidate();
// },
// updateFieldValue(change, records, index) {
//   if (change?.value !== undefined) {
//     //log('got change', change);
//     let record = records[index];
//     if (!record) {
//       record = records[index] = {};
//     }
//     //log('yippie-ki-yay');
//     log('got record at index', record, index);
//     log('setting key to value', change.storeId, change.value);
//     record[change.storeId] = change.value;
//   }
// },
onAdd({records}, state, {invalidate}) {
  state.selectedIndex = records.length;
  records.push(create(null));
  invalidate();
  return({records});
},
render(inputs, {count, selectedIndex}) {
  return {
    count,
    displayIndex: selectedIndex+1
  };
},
onPrev(inputs, state, {invalidate}) {
  state.selectedIndex = (state.selectedIndex - 1 + state.count) % state.count;
  invalidate();
},
onNext(inputs, state, {invalidate}) {
  state.selectedIndex = (state.selectedIndex + 1 + state.count) % state.count;
  invalidate();
},
template: html`
<style>
  :host {
    flex: none !important;
    color: var(--theme-color-fg-1);
    background: var(--theme-color-bg-1);
    padding: 8px;
  }
</style>
<div bar>
  <span flex></span>
  <mwc-icon-button icon="chevron_left" on-click="onPrev"></mwc-icon-button>
  &nbsp;&nbsp;
    navigate&nbsp;(<span>{{displayIndex}}</span>&nbsp;of&nbsp;<span>{{count}}</span></span>)
    &nbsp;
    <mwc-icon-button icon="add_circle" on-click="onAdd"></mwc-icon-button>
  &nbsp;&nbsp;
  <mwc-icon-button icon="chevron_right" on-click="onNext"></mwc-icon-button>
  <span flex></span>
</div>
`
});
