/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
shouldUpdate({input, max}) {
  return input && input.length < max;
},
update({input, max}) {
  if (!max) {
    return {output: []}
  };
  const say = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Ut tortor neque, varius vel bibendum eget, consequat id mi.',
    'Integer ac posuere risus.',
    'Praesent commodo non metus eu ullamcorper.',
    'Nunc euismod, tortor vel ullamcorper tempus, mauris nibh vestibulum neque, a volutpat ipsum augue quis orci.',
    'I see.',
    'No.'
  ];
  const phrase = say[Math.floor(Math.random()*say.length)]
  return {
    output: [...input, phrase]
  }
}
});
