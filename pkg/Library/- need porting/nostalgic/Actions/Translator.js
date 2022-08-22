/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({

shouldUpdate({text}) {
  return Boolean(text);
},

async update({text, translationConfig}, state, {service, output}) {
  if (this.textChanged(text, state) || this.configChanged(translationConfig, state)) {
    assign(state, {text, translationConfig});
    if (state.text) {
      output(await this.translate(state.text, translationConfig, service));
    }
  }
},

textChanged(text, state) {
  return text !== state.text;
},

configChanged(config, state) {
  return config?.inLang !== state.translationConfig?.inLang
      || config?.outLang !== state.translationConfig?.outLang;
},

async translate(text, {inLang, outLang}, service) {
  log(`Translating: ${text}`);
  return {
    translation: {
      text,
      inLang,
      outLang,
      translatedText: await service({kind: 'GoogleApisService', msg: 'translate', data: {text, inLang, outLang}})
    }
  };
}

});
