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
    width: 300px;
    height: 150px;
  }
  [condition] {
    width: 50px;
  }
</style>

<div rows center>
  <div>Weather today in <span>{{city}}</span></div>
  <img condition src="{{conditionIcon}}"/>
  <div><span>{{low}}</span>° - <span>{{high}}</span>°</div>
  <div>{{weather}}</div>
</div>
`,

render({processingResults}) {
  return {
    city: processingResults?.city,
    ...processingResults?.today,
  };
}

});
