/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

async update({ticketsInfo}, state) {
  if (ticketsInfo?.to && ticketsInfo?.options?.length > 0) {
    const textForSpeech = `The next ticket to ${ticketsInfo.to} is at ${ticketsInfo?.options[0].tickets[0].time}`;
    if (state.textForSpeech !== textForSpeech) {
      state.textForSpeech = textForSpeech;
      return {textForSpeech};
    }
  }
}

});
