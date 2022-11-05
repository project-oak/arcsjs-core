/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import * as urls from 'https://arcsjs.web.app/lib/apiUrls.js';

export class GoogleApisService {
  static async fetch(url) {
    const response = await fetch(url, {credentials: 'include'});
    if (response.status == 200) {
      const json = await response.json();
      console.log(json);
      return json;
    }
  }
  static async newsData(country) {
    return GoogleApisService.fetch(`${urls.localNewsDataUrl}${country}`);
  }
  static async weatherData(data) {
    const query = data ? `weather ${data}` : ``;
    return GoogleApisService.fetch(`${urls.weatherDataUrl}${query}`);
  }
  static async reverseCoords(coords) {
    if (coords?.latitude && coords?.longitude) {
      const query = `${urls.mapsUrl}&latlng=${coords.latitude},${coords.longitude}`;
      const response = await fetch(query);
      return await response.json();
    }
  }
  static async translate({text, inLang, outLang}) {
    const response = await GoogleApisService.fetch(`${urls.translateUrl}?inlang=${inLang}&outlang=${outLang}&text=${text}`);
    return response.sentences?.map(s => s.trans)?.join('');
  }
}
