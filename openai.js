import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askOpenAI(prompt) {
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",

    messages: [
      {
        role: "system",
        content:
          "You are the AI narrator of an escape room. Keep responses under 60 words. Never reveal the entire solution unless asked for a hint."
      },
      {
        role: "user",
        content: prompt
      }
    ],

    max_tokens: 80,
    temperature: 0.4
  });

  return response.choices[0].message.content;
}