import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const run = async () => {
  const res = await ai.models.generateContent({
    model: "gemini-pro",
    contents: "Di solo la palabra LIMPIO",
  });

  console.log(res.text);
};

run();
