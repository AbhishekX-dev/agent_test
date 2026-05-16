const apiKey = process.env.OPENROUTER_API_KEY || process.env.MINIMAX_API_KEY || "YOUR_OPENROUTER_API_KEY";

async function testModel() {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "QA Accessibility Agent"
        },
        body: JSON.stringify({
          model: "minimax/minimax-m2",
          messages: [
            {
              role: "system",
              content:
                "You are an AI Accessibility QA Engineer."
            },
            {
              role: "user",
              content:
                "Analyze this accessibility issue: button missing aria-label"
            }
          ],
          temperature: 0.3
        })
      }
    );

    const data = await response.json();

    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  }
}

testModel();
