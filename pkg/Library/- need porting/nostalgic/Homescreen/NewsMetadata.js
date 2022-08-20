/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

async update({contextData}, {}, {service}) {
  if (contextData) {
    const {country, countryFullName} = contextData;
    if (country && countryFullName) {
      return await this.fetchNews(service, country, countryFullName);
    }
  }
},

async fetchNews(service, country, countryFullName) {
  log(`Fetch news for country: ${country}`);
  const news = await service({kind: 'GoogleApisService', msg: 'newsData', data: country});
  return {processingResults: {news, country: countryFullName}};
}

});
