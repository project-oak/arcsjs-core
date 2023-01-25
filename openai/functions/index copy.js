// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// const openai = require("openai");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const log = (...args) => functions.logger.info(...args);

exports.gpt3 = async (req, res) => {
  let content = '';
  log('gpt3 got:', req.query);
  const prompt = req.query.prompt;
  if (prompt) {
    log('sending prompt:', prompt);
    content = await requestCompletion(prompt);
    log('received response:', content);
  }
  Response.send(content);
};

const requestCompletion = async prompt => {
  const body = `${corpus}\n${prompt}`;
  return body;
  //const body = `${prompt}`;
  //const result = await complete(body);
  //return result?.data?.choices?.[0]?.text ?? 'shrug';
};

const corpus = `
Corpus!
`;