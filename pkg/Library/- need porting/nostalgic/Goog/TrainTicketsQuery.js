/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

render({ticketsInfo}) {
  const hasContent = ticketsInfo?.options?.length > 0;
  const model = {
    showContent: hasContent ? 'show' : 'hide'
  };
  if (hasContent) {
    assign(model, {
      from: ticketsInfo.from,
      to: ticketsInfo.to,
      date: ticketsInfo.options[0].date,
    });
  }
  return model;
},

template: html`
<style>
  :host {
    padding: 12px 12px 0;
    color: lightgrey;
  }
</style>
<div display$="{{showContent}}">
  <div>From: <input type="text" value="{{from}}"></div>
  <div>To: <input type="text" value="{{to}}"></div>
  <div>Date: <input type="text" value="{{date}}"></div>
  <button>update search</button>
</div>
`
});
