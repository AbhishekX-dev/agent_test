import 'dotenv/config';

const apiKey = process.env.MINIMAX_API_KEY?.trim();
console.log('Key prefix:', apiKey?.substring(0, 15));

const endpoints = [
  'https://api.minimax.io/v1/chat/completions',
  'https://api.minimax.chat/v1/chat/completions',
  'https://api.minimax.io/v1/text/chatcompletion_v2'
];

for (const url of endpoints) {
  console.log(`\nTrying: ${url}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [{ role: 'user', content: 'say OK' }]
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    const msg = data?.choices?.[0]?.message?.content
      || data?.base_resp?.status_msg
      || data?.error?.message
      || JSON.stringify(data).substring(0, 120);
    console.log('Result:', msg);
    if (res.status === 200 && data?.choices) {
      console.log('\n✅ WORKING ENDPOINT FOUND:', url);
      break;
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
