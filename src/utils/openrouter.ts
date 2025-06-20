export async function callOpenRouter(messages: any[], model: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 800,
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
} 