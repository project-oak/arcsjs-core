/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
import {logFactory} from '../Core/core.js'; //'../../graph/conf/arcs.js';

const log = logFactory(logFactory.flags.services || logFactory.flags.OpenAiService, 'OpenAiService', 'coral');

const server = `https://openai.iamthearchitect.workers.dev/`;

const post = (url, body) => fetch(url, {method: 'POST', body: JSON.stringify(body)});

export const OpenAiService = {
  async complete({prompt, context}) {
    log('completing prompt:', prompt);
    let response;
    if (context) {
      response = await post(server, `${context}${prompt}`);
    } else {
      response = await fetch(`${server}?prompt=${prompt}`);
    }
    const text = await response.text();
    log(text);
    return text;
  },
  async generate({prompt}) {
    log('generating:', prompt);
    // prompt: a text description of the desired image(s). The maximum length is 1000 characters.
    // [size]: Defaults to 1024x1024, must be one of 256x256, 512x512, or 1024x1024.
    // [n]: number of images to generate
    const response = await post(`${server}/image`, {
      prompt,
      size: '512x512'
    });
    const text = await response.text();
    log(text);
    return text;
  }
};