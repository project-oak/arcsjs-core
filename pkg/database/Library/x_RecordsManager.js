/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({

async update({records, event}, state) {
  if (!deepEqual(event, state.event)) {
    state.event = event;
    if (state.event) {
      return this.handleEvent(records, state.event);
    }
  }
},

handleEvent(records, {type, record}) {
  const index = records?.findIndex(({id}) => record.id === id);
  switch (type) {
    case 'delete':
      return this.deleteRecord(records, index);
    case 'save': {
      return this.saveRecord(records, record, index);
    }
  }
},

deleteRecord(records, index) {
  if (index >= 0) {
    records.splice(index, 1);
  }
  return {records, event: null};
},

saveRecord(records, record, index) {
  if (index >= 0) {
    records[index] = record;
  } else {
    records.push(record);
  }
  return {records};
}

});

