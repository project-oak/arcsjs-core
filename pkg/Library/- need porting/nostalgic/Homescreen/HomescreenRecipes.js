/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const WeatherForecastRecipe = {
  $meta: {
    name: 'Weather',
    category: 'fun',
  },
  $stores: {
    Geolocation: {
      $type: 'Geolocation',
      connection: true
    },
    WeatherForecast: {
      $type: 'WeatherForecast',
      noinspect: true
    }
  },
  WeatherForecastingMetadata: {
    $kind: 'nostalgic/Homescreen/WeatherForecastMetadata',
    $inputs: [{contextData: 'Geolocation'}],
    $outputs: [{processingResults: 'WeatherForecast'}]
  },
  WeatherForecastDisplay: {
    $kind: 'nostalgic/Homescreen/WeatherForecastDisplay',
    $inputs: [{processingResults: 'WeatherForecast'}]
  }
};

export const NewsRecipe = {
  $meta: {
    name: 'News',
    category: 'fun',
    // devices: ['builder', 'smartscreen']
  },
  $stores: {
    Geolocation: {
      $type: 'Geolocation',
      connection: true
    },
    News: {
      $type: 'News',
      noinspect: true
    }
  },
  NewsMetadata: {
    $kind: 'nostalgic/Homescreen/NewsMetadata',
    $inputs: [{contextData: 'Geolocation'}],
    $outputs: [{processingResults: 'News'}]
  },
  NewsDisplay: {
    $kind: 'nostalgic/Homescreen/NewsActionDisplay',
    $inputs: [
      {contextData: 'Geolocation'},
      {processingResults: 'News'}
    ]
  }
};
