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
      name: ticketsInfo.options[0].name,
      date: ticketsInfo.options[0].date,
      tickets: ticketsInfo.options[0].tickets
    });
  }
  return model;
},
onOptionClicked({eventlet: {key}, ticketsInfo}) {
  log(`Looking to buy tickets from ${ticketsInfo.from} to ${ticketsInfo.to} at ${key}`);
  return {url: 'https://www.viarail.ca/'};
},
template: html`
<style>
  :host {
    padding: 12px 12px 0;
    color: lightgrey;
  }
  [info] {
    font-size: 0.8em;
    text-align: center;
    line-height: 20px;
  }
  [capsule] {
    border: 1px solid #555A;
    border-radius: 64px;
    padding: 12px 36px;
    margin-bottom: 4px;
    cursor: pointer;
  }
</style>

<div display$="{{showContent}}">
  <div info>{{name}}</div>
  <div info><span>{{from}}</span> to <span>{{to}}</span> <span>{{date}}</span></div>
  <div flex center rows large repeat="ticket_t">{{tickets}}</div>
</div>

<template ticket_t>
  <div capsule on-click="onOptionClicked" key="{{time}}">
    <span>{{time}}</span>
    <span>{{price}}</span>
  </div>
</template>
`

});
