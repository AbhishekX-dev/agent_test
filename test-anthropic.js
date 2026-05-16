import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL
});

async function test() {
  try {
    const msg = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: "Analyze this WCAG issue: button missing aria-label"
        }
      ]
    });

    console.log(msg.content);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

test();
