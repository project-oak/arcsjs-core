/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.js` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.js --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
'use strict';

import './corpus.js';

const log = (...args) => console.log(...args);

const corpus = ''; //globalThis.corpus;

export default {
  async fetch(req, env, ctx) {
    let task = requestCompletion;
    if (/favicon/.test(req.url)) {
      return new Response();
    }
    if (/image/.test(req.url)) {
      task = requestGeneration;
    }
    let response =
      corsListener(req)
      ?? openAiListener(req, task)
      ;
    return response;b
  }
};

const openAiListener = async (req, task) => {
  let content = '';
  let body;
  // If POST, use the body directly
  if (req.method === 'POST') {
    body = await req.text();
    log('got POST data', body);
  // If GET, prepend the default corpus to make body
  } else {
    const url = new URL(req.url, 'http://scotts.open.ai');
    const prompt = url.searchParams.get('prompt') ?? 'Show a raspberry.';
    body = `${corpus}${prompt}`;
  }
  if (body) {
    log('sending body:', body);
    content = await task(body);
    log('received response:', content);
  }
  return new Response(content, {headers: getCorsHeaders()});
};

const requestCompletion = async body => {
  const result = await complete(body);
  return result?.choices?.[0]?.text ?? 'shrug';
};

const requestGeneration = async body => {
  const result = await generate(body);
  return result.data?.[0]?.url;
};

const apiKey = "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";

const complete = async text => {
  try {
    log('completing:');
    const params = {
      model: "text-davinci-002",
      prompt: text ?? "Say this is a test",
      temperature: 0.7,
      max_tokens: 2048,
    };
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: new Headers({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(params)
    });
    log(response);
    const result = await response.json();
    log(result);
    return result;
  } catch(x) {
    log(x);
    return x;
  }
};

const generate = async prompt => {
  try {
    log('generating:');
    const params = {
      prompt
    };
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: new Headers({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(params)
    });
    log(JSON.stringify(response));
    const result = await response.json();
    log(JSON.stringify(result));
    return result;
  } catch(x) {
    log(JSON.stringify(x, null, '  '));
    return x;
  }
};

//

const getCorsHeaders = () => {
  const corsHeaders = new Headers();
  corsHeaders.append('Access-Control-Allow-Origin', '*');
  corsHeaders.append('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS');
  corsHeaders.append('Access-Control-Max-Age', '86400');
  return corsHeaders;
};

const corsListener = req => {
  if (req.method === 'OPTIONS') {
    return handleOptions(req);
  }
};

function handleOptions(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers;
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers')
    };
    return new Response(null, {
      headers: respHeaders
    });
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, POST, OPTIONS'
      }
    });
  }
}
