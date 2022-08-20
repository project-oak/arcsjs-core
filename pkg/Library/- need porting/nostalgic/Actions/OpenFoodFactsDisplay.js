/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
/* global assets */
assets: resolve(`$library/Actions/assets`),

render({imageRef, metadataResults}) {
  const ready = Boolean(imageRef && metadataResults?.length);
  const details = ready && this.renderDetails(metadataResults);
  return {
    displayProgress: String(!ready),
    displayInfo: String(ready),
    ...details
  };
},

renderDetails(metadataResults) {
  const product = metadataResults?.product;
  const name = product?.product_name;
  const nutriscore = product?.nutriscore_grade || 'e';
  const getNutriscore = score => !score?.toLowerCase ? '' : `${assets}/nutriscore_${score.toLowerCase()}.png`;
  return {
    nutriscoreImg: getNutriscore(nutriscore),
    url: `https://www.google.com/search?q=${name?.replaceAll(' ', '+')}`
    // src: product?.image_url || '',
  };
},

template: html`

<style>
  :host {
    display: block;
    /* border-radius: 16px;
    padding: 16px;
    background-color: #050505E0;
    box-shadow: var(--theme-color-5) 0px 7px 9px 0px; */
  }
  [container] {
    box-sizing: border-box;
  }
  [nutriscore] {
    width: 180px;
    height: 100px;
    /* margin: auto; */
  }
  [nutriscore] > img {
    width: 180px;
    height: 100px;
  }
  a {
    text-decoration: none;
  }
  [learn-more] {
    display: inline-block;
    background-color: #ffffffe0;
    border-radius: 8px;
    border: solid 1px #333;
    color: var(--md-grey-700);
    padding: 4px 12px;
    font-size: 14px;
  }
</style>

<div feed>

  <mwc-linear-progress display$="{{displayProgress}}" indeterminate></mwc-linear-progress>

  <div container mode="object-name" display$="{{displayInfo}}">
    <div nutriscore>
      <img src="{{nutriscoreImg}}">
    </div>
  </div>

  <div mode="user-actions" display$="{{displayInfo}}">
    <div learn-more>
      <a target="_blank" href="{{url}}">learn more</a>
    </div>
  </div>

</div>
`
});
