/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
initialize(inputs, state, {service}) {
  state.generate = prompt => service({kind: 'OpenAiService', msg: 'generate', data: {prompt}});
},
shouldUpdate({pages}) {
  return pages;
},
async update({pages}, state, {output}) {
  // request pages serially, at first
  for (const page of pages) {
    if (!page.image.url) {
      log('query openai');
      const response = await state.generate(page.text);
      page.image.url = response ?? '_';
      output({illustratedPages: pages});
    }
  }
}
});
