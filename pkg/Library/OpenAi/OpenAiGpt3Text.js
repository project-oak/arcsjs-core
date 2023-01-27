/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
initialize(inputs, state, {service}) {
  state.llm = (context, prompt) => service({kind: 'OpenAiService', msg: 'complete', data: {context, prompt}});
},
shouldUpdate({prompt}) {
  return prompt;
},
async update({context, prompt, result}, state, {output}) {
  if (!state.prompt && result) {
    log('prompt && result but no state prompt, caching prompt:', prompt);
    state.prompt = prompt;
  }
  if (state.prompt !== prompt || !result || context !== state.context) {
    log('prompt && !result, caching prompt:', prompt);
    if (context !== state.context) {
      log('context', context);
    }
    state.context = context;
    state.prompt = prompt;
    //
    // log('output temporary result');
    // output({result: `${prompt}\n\n...cogitating...`});
    //
    // if (state.context?.includes?.(prompt)) {
    //   prompt = '';
    // }
    log('query gpt3 (text only)');
    let result = await state.llm(context, prompt) ?? '';
    //
    result = result.replace(/[\+\"]/g, '').replace(/\\n/g, '').trim();
    //
    return {result};
  }
}
});
