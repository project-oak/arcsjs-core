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
shouldUpdate({prompt}) {
  return prompt;
},
async update({prompt, image}, state, {output}) {
  if (!state.prompt && image) {
    log('prompt && image but no state prompt, caching prompt:', prompt);
    state.prompt = prompt;
  }
  if (state.prompt !== prompt || !image) {
    log('prompt && !image, caching prompt:', prompt);
    state.prompt = prompt;
    //
    //log('output temporary result');
    //output({result: `${prompt}\n\n...cogitating...`});
    //
    log('query openai');
    const response = await state.generate(prompt);
    //
    log('got response', response);
    return {
      image: {url: response}
    };
  }
}
});
