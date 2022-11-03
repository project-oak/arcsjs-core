/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({

shouldUpdate({inputChat}) {
  return Boolean(inputChat);
},

async update({inputChat, name}) {
  const phrase = await this.chatBotRequest(inputChat);
  return {
    outputChat: [...inputChat, {name, phrase}]
  }
},

async chatBotRequest(chat) {
  const say = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Ut tortor neque, varius vel bibendum eget, consequat id mi.',
    'Integer ac posuere risus.',
    'Praesent commodo non metus eu ullamcorper.',
    'Nunc euismod, tortor vel ullamcorper tempus, mauris nibh vestibulum neque, a volutpat ipsum augue quis orci.',
    'I see.',
    'Not quite.'
  ];
  return say[Math.floor(Math.random()*say.length)]
}

});
