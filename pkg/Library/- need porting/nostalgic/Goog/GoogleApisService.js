/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// const newsDataUrl = 'https://jetway.corp.google.com/api/1624383346408';
const localNewsDataUrl = 'https://jetway.corp.google.com/api/1626795065047?country='
const weatherDataUrl = `https://jetway.corp.google.com/api/1522270142414/?query=`;
const mapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAAjvSbo8xxIuK0f530_YJBi2_DEHMMQ28&`;
const translateUrl = `https://jetway.corp.google.com/api/1541441605817`; //?inlang=en&outlang=es&text=hello`;
const runMacroEndpointUrl = 'https://api-dot-macromaker.googleplex.com/run-macro';

export class GoogleApisService {
  static async receive({msg, data}) {
    return await GoogleApisService[msg]?.(data);
  }
  static async fetch(url) {
    const response = await fetch(url, {credentials: 'include'});
    if (response.status == 200) {
      const json = await response.json();
      console.log(json);
      return json;
    }
  }
  static async newsData(country) {
    // let results = await GoogleApis.fetch(newsDataUrl);
    return GoogleApisService.fetch(`${localNewsDataUrl}${country}`);
  }
  static async weatherData(data) {
    const query = data ? `weather ${data}` : ``;
    return GoogleApisService.fetch(`${weatherDataUrl}${query}`);
  }
  static async reverseCoords(coords) {
    if (coords?.latitude && coords?.longitude) {
      const query = `${mapsUrl}&latlng=${coords.latitude},${coords.longitude}`;
      const response = await fetch(query);
      return await response.json();
    }
  }
  static async translate({text, inLang, outLang}) {
    const response = await GoogleApisService.fetch(`${translateUrl}?inlang=${inLang}&outlang=${outLang}&text=${text}`);
    return response.sentences?.map(s => s.trans)?.join('');
  }
  static async runMacro({macroId, inputs}) {
    const formData = new FormData();
    formData.append("id", macroId);
    formData.append("userInputs", JSON.stringify(inputs));
    formData.append("temperature", 0.1);
    const payload = {
      credentials: 'include',
      method: 'POST',
      body: formData
    };
    // Make the fetch request:
    const response = await fetch(runMacroEndpointUrl, payload);
    const json = await response.json();
    console.warn(json);
    return json;
  }
}
