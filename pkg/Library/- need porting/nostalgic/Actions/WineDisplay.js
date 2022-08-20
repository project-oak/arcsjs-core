/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/* global assets */
({

assets: resolve(`$library/Actions/assets`),

render({classifierResults: data}) {
  return Boolean(data?.length) && this.renderFactoid(data[0]?.displayName?.split?.(' | '));
},

renderFactoid([label, price, rawRating, lpId, country, region, owner, wineType]) {
  const ratingSummary = (rawRating || '').split(' ');
  const [rating, ratingCount] = ratingSummary;
  const ratingInt = rating;
  const getFlagPath = country => !country?.toLowerCase ? '' : `${assets}/${country.toLowerCase()}.png`;
  const results = {
    name: label.replace(`${owner} `, ''),
    owner,
    flag: getFlagPath(country),
    provenance: `${wineType} from ${region} · ${country}`,
    rating,
    ratingCount: `${ratingCount} rating${ratingCount !== 1 ? 's': ''}`,
    stars: this.renderStars(ratingInt),
    landingPage: `https://www.vivino.com/wine/w/${lpId}`,
    price: `$${price}`,
  };
  log(results);
  return results;
},

renderStars(ratingInt) {
  const models = [];
  ratingInt = isNaN(ratingInt) ? 4 : ratingInt;
  for (let i=1; i<5; i++) {
    models.push({star: `${assets}/${i < ratingInt ? 'star.png' : 'star_empty.png'}`});
  }
  return {
    $template: 'starTemplate',
    models
  };
},

template: html`

<style>
  :host {
    display: block;
  }
  * {
    box-sizing: border-box;
  }
  [container] {
    align-items: var(--display-align-items) !important;
    text-align: var(--display-text-align) !important;
  }
  pre {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: sans-serif;
  }
  [bar] {
    padding: 6px 0;
  }
  [flag] {
    height: 1.75em;
    margin-right: 0.5em;
    border: 2px solid var(--theme-color-3);
    border-radius: 50%;
  }
  [wishlist] {
    font-size: 0.9em;
    font-style: italic;
  }
  [wishlist] > img {
    height: 1.25em;
    margin: 0 6px 0 5px;
  }
  [star] {
    height: 1.25em;
  }
</style>

<div container rows display$="{{displayInfo}}">
  <div>
    <span unsafe-html="{{owner}}"></span> - <span>{{name}}</span>
  </div>
  <div bar><img flag src="{{flag}}"><span>{{stars}}</span></div>
  <div>{{provenance}}</div>
  <div wishlist bar>
    <img src="${resolve(`$library/Actions/assets`)}/wishlist_logo.png">
    <div text>add to wishlist</div>
  </div>
</div>

<template starTemplate>
  <img star src="{{star}}">
</template>

`
});
