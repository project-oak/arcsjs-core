import {Configuration, OpenAIApi} from "openai";

//const apiKey = process.env.OPENAI_API_KEY;
const apiKey = "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";

const configuration = new Configuration({apiKey});
const openai = new OpenAIApi(configuration);

export const complete = async text => {
  try {
    console.log(text);
    const result = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: text ?? "Say this is a test",
      temperature: 0.7,
      max_tokens: 2048,
    });
    return result;
  } catch(x) {
    console.log(x);
    return x;
  }
};