/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

template: html`
  <style>
    :host {
      display: none !important;
    }
  </style>
  <geo-location on-coords="onCoords"></geo-location>
`,

async onCoords({eventlet: {value}}, state, {service}) {
  log(`coords: ${JSON.stringify(value)}`);
  const {latitude, longitude} = value;
  // if (latitude && longitude && this.coordsChanged({latitude, longitude}, state.coords)) {
    //state.coords = value;
    return await this.fetchLocation(service, {latitude, longitude});
  //}
},

async fetchLocation(service, coords) {
  const response = await service({kind: 'GoogleApisService', msg: 'reverseCoords', data: coords});
  const addressComponents = response?.results[0]?.address_components;
  const countryComponent = addressComponents?.find(r => r.types.includes('country'));
  const cityComponent = addressComponents?.find(r => r.types.includes('locality'));
  const country = countryComponent?.short_name || 'US';
  const countryFullName = countryComponent?.long_name || 'United States';
  const city  = cityComponent?.long_name || 'San Francisco';
  log(`coords ${JSON.stringify(coords)} are in ${city}, ${countryFullName}`);
  return {Geolocation: {...coords, city, country, countryFullName}};
},
// coordsChanged({latitude, longitude}, lastCoords) {
//   return (latitude && latitude !== lastCoords?.latitude) ||
//          (longitude && longitude !== lastCoords?.longitude);
// }

});
