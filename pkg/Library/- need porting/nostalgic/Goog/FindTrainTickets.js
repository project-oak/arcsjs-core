/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

async update({transcript, Geolocation}) {
  if (Geolocation?.city) {
    const findDestination = text => {
      for (const token of ['ticket', 'train', 'tickets']) {
        const matches = text?.match(new RegExp(`${token} to (.*)`));
        if (matches) {
          return matches[1];
        }
      }
    };
    const to = findDestination(transcript?.transcript);
    if (to) {
      const date = new Date();
      const [hours, month, day, year] = [date.getHours(), date.getMonth(), date.getDate(), date.getFullYear()];
      const next = (hours + Math.floor(Math.random()*5)) % 12 + 1;
      const ticketsInfo = {
        from: Geolocation?.city,
        to,
        options: [
          {
            name: `Acela Express`,
            date: `${month+1}/${day}/${year}`,
            tickets: [{
              time: `${next}pm`,
              price: `$${Math.floor(Math.random()* 1000)}`
            }, {
              time: `${next+2}pm`,
              price: `$${Math.floor(Math.random()* 1000)}`
            }]
          }
        ]
      };
      return {ticketsInfo};
    }
  }
}

});
