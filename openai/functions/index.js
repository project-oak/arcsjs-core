'use strict';

const openai = require("openai");

// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

const log = (...args) => functions.logger.info(...args);

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.gpt3 = functions.https.onRequest(async (req, res) => {
  let content = '';
  log('gpt3 got:', req.query);
  const prompt = req.query.prompt;
  if (prompt) {
    log('sending prompt:', prompt);
    content = await requestCompletion(prompt);
    log('received response:', content);
  }
  // Send back a message that we've successfully written the message
  // res.write(content);
  // res.end();
  //res.json({result: content});
  res.set('Access-Control-Allow-Origin', '*');
  res.send(content);
});

require('./corpus.js');
const {corpus} = globalThis;

const requestCompletion = async prompt => {
  if (!corpus) {
    corpus = await (await fetch('./corpus.json')).text();
  }
  const body = `${corpus}\n${prompt}`;
  const result = await complete(body);
  return result?.data?.choices?.[0]?.text ?? 'shrug';
};

// const corpus = `
// Corpus!
// `;

/* */

const apiKey = "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";

const configuration = new openai.Configuration({apiKey});
const api = new openai.OpenAIApi(configuration);

const complete = async text => {
  try {
    log('creatingCompletion:');
    const result = await api.createCompletion({
      model: "text-davinci-002",
      prompt: text ?? "Say this is a test",
      temperature: 0.7,
      max_tokens: 2048,
    });
    return result;
  } catch(x) {
    log(x);
    return x;
  }
};