/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

async update({contextData}, {}, {service}) {
  return await this.fetchWeather(contextData, service);
},

async fetchWeather(contextData, service) {
  const city = contextData?.city;
  if (city) {
    log(`Fetch weather for city: ${city}`);
    const weather = await service({kind: 'GoogleApisService', msg: 'weatherData', data: city});
    return {processingResults: {...weather, city}};
  }
}

});
