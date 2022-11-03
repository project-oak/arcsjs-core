import { deepEqual } from "../../Library/Core/utils.min";

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
  const results = {records};
  switch (type) {
    case 'delete':
      if (index >= 0) {
        records.splice(index, 1);
      }
      assign(results, {event: null});
      break;
    case 'save': {
      if (index >= 0) {
        records[index] = record;
      } else {
        records.push(record);
      }
      break;
    }
  }
  return results;
}

});

