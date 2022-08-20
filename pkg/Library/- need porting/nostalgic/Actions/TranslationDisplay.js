/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
/*global assets */
assets: resolve(`$library/nostalgic/Actions/assets`),

render({translation: {text: originalText, inLang, outLang, translatedText}, languages}) {
  if (originalText) {
    const languageToCountry = lang => {
      return languages.find(l => l.lang === lang)?.country || 'world';
    };
    const getFlagPath = lang => `${assets}/${languageToCountry(lang)}.png`;
    return {
      originalText,
      translatedText,
      inFlag: getFlagPath(inLang),
      outFlag: getFlagPath(outLang)
    };
  }
},

template: html`
<style>
  :host {
    display: block;
    font-size: 1.5em;
    padding: 8px;
    white-space: pre-wrap;
    border: 1px dotted lightgray;
    min-height: 50px;
  }
  [output] {
    padding-bottom: 4px;
    font-size: 18px;
  }
  [input] {
    font-style: italic;
    font-weight: normal;
    opacity: 0.5;
    font-size: 14px;
  }
  [flag] {
    height: 1.75em;
    margin-right: 0.5em;
    border-radius: 50%;
  }
</style>

<div output><img flag src="{{outFlag}}"><span>{{translatedText}}</span></div>
<div input><img flag src="{{inFlag}}"><span>{{originalText}}</span></div>
`

});
