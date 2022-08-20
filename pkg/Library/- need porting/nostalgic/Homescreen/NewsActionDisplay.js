/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
template: html`
  <style>
    :host {
      position: relative;
      overflow: hidden;
      padding: 12px 12px 0;
      width: 500px;
      height: 350px;
    }
  </style>
  <div rows center display$="{{showContent}}">
    <div><b>In the News: <i>{{country}}</i></b></div>
    <div>{{news}}</div>
  </div>

  <template newsT>
    <div bar style="margin: 12px 0; white-space: normal;">
      <img style="width: 48px; height: 48px; margin-right: 12px; vertical-align: middle; border-radius: 8px;" src="{{thumbnailUrl}}">
      <span flex>{{title}}</span>
    </div>
  </template>
`,

render({contextData, processingResults}) {
  const isEmpty = obj => !obj || !keys(obj).length;
  return {
    showContent: isEmpty(contextData) ? 'hide' : 'show',
    country: processingResults?.country,
    news: this.renderNews(processingResults?.news),
  };
},

renderNews(news) {
  return news && {
    $template: 'newsT',
    models: values(news)
  };
}
});
